use anyhow::{Context as AnyhowContext, Result};
use aptos_move_graphql_scalars::Address;
use aptos_processor_framework::{
    indexer_protos::transaction::v1::{
        transaction::TxnData, transaction_payload::Payload, write_set_change::Change,
        EntryFunctionId, MoveModuleId, MoveStructTag, Transaction,
    },
    txn_parsers::get_clean_entry_function_payload,
    ProcessingResult, ProcessorTrait,
};
use metadata_storage::{MetadataStorageTrait, UpdateAttributionIntent};
use move_types::{Canvas, Entry, Object, Pixel};
use pixel_storage::{CreateCanvasIntent, PixelStorageTrait, WritePixelIntent};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{str::FromStr, sync::Arc};
use tracing::info;

const CANVAS_TOKEN_MODULE_NAME: &str = "canvas_token";

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct CanvasProcessorConfig {
    // TODO: This should be an Address instead
    pub canvas_contract_address: String,
}

#[derive(Debug)]
pub struct CanvasProcessor {
    config: CanvasProcessorConfig,
    pixels_storage: Arc<dyn PixelStorageTrait>,
    metadata_storage: Arc<dyn MetadataStorageTrait>,
}

impl CanvasProcessor {
    pub fn new(
        config: CanvasProcessorConfig,
        pixels_storage: Arc<dyn PixelStorageTrait>,
        metadata_storage: Arc<dyn MetadataStorageTrait>,
    ) -> Self {
        Self {
            config,
            pixels_storage,
            metadata_storage,
        }
    }

    pub fn get_canvas_struct_tag(&self) -> MoveStructTag {
        MoveStructTag {
            address: self.config.canvas_contract_address.clone(),
            module: CANVAS_TOKEN_MODULE_NAME.to_string(),
            name: "Canvas".to_string(),
            generic_type_params: vec![],
        }
    }
}

/// A processor that just prints the txn version.
#[async_trait::async_trait]
impl ProcessorTrait for CanvasProcessor {
    fn name(&self) -> &'static str {
        "CanvasProcessor"
    }

    async fn process_transactions(
        &self,
        transactions: Vec<Transaction>,
        start_version: u64,
        end_version: u64,
    ) -> Result<ProcessingResult> {
        let mut all_create_canvas_intents = Vec::new();
        let mut all_write_pixel_intents = Vec::new();
        let mut all_update_attribution_intents = Vec::new();
        for transaction in transactions {
            // todo process canvas_token::create and create images for that
            // todo create a storage interface with like create that takes in a default color
            // a width and height, then methods for writing pixels to it, and also reading
            // the full thing. it should handle the read update write process inside it
            let (write_pixel_intents, update_attribution_intents) = self
                .process_draw(&transaction)
                .context("Failed at process_draw")?;
            all_write_pixel_intents.extend(write_pixel_intents);
            all_update_attribution_intents.extend(update_attribution_intents);
            let create_canvas_intent = self
                .process_create(&transaction)
                .context("Failed at process_create")?;
            if let Some(create_canvas_intent) = create_canvas_intent {
                all_create_canvas_intents.push(create_canvas_intent);
            }
        }
        info!(
            start_version = start_version,
            end_version = end_version,
            processor_name = self.name(),
            num_canvases_to_create = all_create_canvas_intents.len(),
            num_pixels_to_write = all_write_pixel_intents.len()
        );

        // TODO: Parallelize this.

        // Create canvases.
        for create_canvas_intent in all_create_canvas_intents {
            info!("Creating canvas {}", create_canvas_intent.canvas_address);
            self.pixels_storage
                .create_canvas(create_canvas_intent)
                .await
                .context("Failed to create canvas in storage")?;
        }

        // Write pixels.
        let len = all_write_pixel_intents.len();
        for (i, write_pixel_intent) in all_write_pixel_intents.into_iter().enumerate() {
            info!(
                "Writing pixel to canvas {} index {} (intent {}/{} from txns {} to {})",
                write_pixel_intent.canvas_address,
                write_pixel_intent.index,
                i + 1,
                len,
                start_version,
                end_version
            );
            self.pixels_storage
                .write_pixel(write_pixel_intent)
                .await
                .context("Failed to write pixel in storage")?;
        }

        // Update attribution.
        let len = all_update_attribution_intents.len();
        for (i, update_attribution_intent) in all_update_attribution_intents.into_iter().enumerate()
        {
            info!(
                "Updating attribution for canvas {} index {} (intent {}/{} from txns {} to {})",
                update_attribution_intent.canvas_address,
                update_attribution_intent.index,
                i + 1,
                len,
                start_version,
                end_version
            );
            self.metadata_storage
                .update_attribution(update_attribution_intent)
                .await
                .context("Failed to update attribution in storage")?;
        }

        Ok((start_version, end_version))
    }
}

impl CanvasProcessor {
    fn process_draw(
        &self,
        transaction: &Transaction,
    ) -> Result<(Vec<WritePixelIntent>, Vec<UpdateAttributionIntent>)> {
        let nothing = Ok((vec![], vec![]));

        // Skip this transaction if this wasn't a draw transaction.
        let draw_function_id = EntryFunctionId {
            module: Some(MoveModuleId {
                address: self.config.canvas_contract_address.clone(),
                name: CANVAS_TOKEN_MODULE_NAME.to_string(),
            }),
            name: "draw".to_string(),
        };
        let draw_one_function_id = EntryFunctionId {
            module: Some(MoveModuleId {
                address: self.config.canvas_contract_address.clone(),
                name: CANVAS_TOKEN_MODULE_NAME.to_string(),
            }),
            name: "draw_one".to_string(),
        };
        if !(entry_function_id_matches(transaction, &draw_function_id)
            || entry_function_id_matches(transaction, &draw_one_function_id))
        {
            return nothing;
        }

        let txn_data = transaction.txn_data.as_ref().context("No txn_data")?;
        let user_transaction = match txn_data {
            TxnData::User(user_transaction) => user_transaction,
            _ => return nothing,
        };
        let request = user_transaction.request.as_ref().context("No request")?;
        let payload = request.payload.as_ref().unwrap();
        let entry_function_payload = match payload.payload.as_ref().context("No payload")? {
            Payload::EntryFunctionPayload(payload) => payload,
            _ => return nothing,
        };

        let clean_entry_function_payload =
            get_clean_entry_function_payload(entry_function_payload, 0);

        let first_arg = clean_entry_function_payload.arguments[0].clone();

        let obj: Object = serde_json::from_value(first_arg).unwrap();
        let canvas_address = obj.inner;

        let draw_value_type = format!(
            "vector<0x1::smart_table::Entry<u64, {}::canvas_token::Pixel>>",
            self.config.canvas_contract_address
        );

        let info = transaction.info.as_ref().context("No info")?;
        let sender =
            Address::from_str(&request.sender).context("Failed to parse sender address")?;

        let mut write_pixel_intents = vec![];
        let mut update_attribution_intents = vec![];

        for change in &info.changes {
            match change.change.as_ref().context("No change")? {
                // There could be multiple WriteTableItems since draw supports drawing
                // multiple pixels at once.
                Change::WriteTableItem(resource) => {
                    let data = resource.data.as_ref().context("No WriteTableItem data")?;
                    if data.value_type != draw_value_type {
                        continue;
                    }
                    let values: Vec<Value> = serde_json::from_str(&data.value).unwrap();
                    // There could be many values because a SmartTable internally is a
                    // Table where the values are vectors. This means each WriteTableItem
                    // will have the full new vector being written.
                    for value in values {
                        let value: Entry =
                            serde_json::from_value(value).context("Failed to parse as Entry")?;
                        let index = value.key.as_str().unwrap().parse::<u64>().unwrap();
                        let pixel: Pixel = serde_json::from_value(value.value).unwrap();
                        write_pixel_intents.push(WritePixelIntent {
                            canvas_address,
                            index,
                            color: pixel.color,
                        });
                        update_attribution_intents.push(UpdateAttributionIntent {
                            canvas_address,
                            artist_address: sender,
                            index,
                            drawn_at_secs: pixel.drawn_at_s.0,
                        });
                    }
                },
                _ => continue,
            }
        }

        Ok((write_pixel_intents, update_attribution_intents))
    }

    fn process_create(&self, transaction: &Transaction) -> Result<Option<CreateCanvasIntent>> {
        // Skip this transaction if this wasn't a create transaction.
        let create_function_id = EntryFunctionId {
            module: Some(MoveModuleId {
                address: self.config.canvas_contract_address.clone(),
                name: CANVAS_TOKEN_MODULE_NAME.to_string(),
            }),
            name: "create".to_string(),
        };
        if !entry_function_id_matches(transaction, &create_function_id) {
            return Ok(None);
        }

        let info = transaction.info.as_ref().context("No info")?;

        for change in &info.changes {
            match change.change.as_ref().context("No change")? {
                Change::WriteResource(resource) => {
                    if resource.r#type.as_ref().unwrap() != &self.get_canvas_struct_tag() {
                        continue;
                    }
                    let canvas: Canvas =
                        serde_json::from_str(&resource.data).context("Failed to parse Canvas")?;
                    return Ok(Some(CreateCanvasIntent {
                        canvas_address: Address::from_str(&resource.address).unwrap(),
                        width: canvas.config.width.0,
                        height: canvas.config.height.0,
                        default_color: canvas.config.default_color,
                    }));
                },
                _ => continue,
            }
        }
        Ok(None)
    }
}

fn entry_function_id_matches(
    transaction: &Transaction,
    entry_function_id: &EntryFunctionId,
) -> bool {
    let txn_data = transaction
        .txn_data
        .as_ref()
        .context("No txn_data")
        .unwrap();
    let user_transaction = match txn_data {
        TxnData::User(user_transaction) => user_transaction,
        _ => return false,
    };
    let request = user_transaction
        .request
        .as_ref()
        .context("No request")
        .unwrap();
    let payload = request.payload.as_ref().unwrap();
    let entry_function_payload = match payload.payload.as_ref().context("No payload").unwrap() {
        Payload::EntryFunctionPayload(payload) => payload,
        _ => return false,
    };

    let function_id = entry_function_payload
        .function
        .as_ref()
        .context("No function")
        .unwrap();

    function_id == entry_function_id
}

// Functions we need:
// - Make it easier to pull out the entry function payload, one function.
// - Something like get_clean_* for each of the Change:: variants, like WriteTableData.
// - This entry_function_id_matches function above.
