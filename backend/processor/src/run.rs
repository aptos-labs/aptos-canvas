//! Using these functions the dev can build and run all the components required to run
//! the processor. The dev could glue all these pieces together themselves, this file
//! doesn't use anything private, so this is all just for dev convenience / dedupe.

use crate::{CanvasProcessor, CanvasProcessorConfig};
use anyhow::Result;
use aptos_processor_framework::{
    CommonStorageConfig, Dispatcher, DispatcherConfig, GrpcStreamSubscriber,
    GrpcStreamSubscriberConfig, ProcessorTrait, StorageTrait, StreamSubscriberTrait,
};
use metadata_storage::PostgresMetadataStorage;
use pixel_storage::MmapPixelStorage;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::task::JoinHandle;

/// This contains all the configs necessary to build the components required to run the
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct RunConfig {
    pub stream_subscriber_config: GrpcStreamSubscriberConfig,
    pub dispatcher_config: DispatcherConfig,
    pub common_storage_config: CommonStorageConfig,
    pub processor_config: CanvasProcessorConfig,
}

/// Build all the relevant pieces required to run the processor, and the processor
/// itself, and spawn tokio tasks for them. This returns handles to those tasks.
pub async fn run(
    config: RunConfig,
    metadata_storage: Arc<PostgresMetadataStorage>,
    pixels_storage: Arc<MmapPixelStorage>,
) -> Result<Vec<JoinHandle<()>>> {
    // Build the canvas processor, which is what processes transactions and updates the
    // canvas storage and the DB.
    let processor = Arc::new(CanvasProcessor::new(
        config.processor_config.clone(),
        pixels_storage.clone(),
        metadata_storage.clone(),
    ));

    // From the DB, read the last version we processed.
    let starting_version_from_db = metadata_storage
        .read_last_processed_version(processor.name())
        .await?;

    // Determine the actual version we'll start from based on the data in the DB and
    // the values in the config.
    let starting_version = config
        .common_storage_config
        .determine_starting_version(starting_version_from_db);

    // Build the stream subscriber, which subscribes to txn stream service and pushes
    // the txns to an internal channel.
    let stream_subscriber = GrpcStreamSubscriber {
        config: config.stream_subscriber_config.clone(),
        processor_name: processor.name().to_string(),
        starting_version,
    };

    // Start the stream subscriber.
    let channel_handle = stream_subscriber.start().await?;

    // Forcibly set the number of concurrent workers to 1. This processor depends on
    // txns being processed in order because of how we only create files when we
    // process the create canvas txns.
    let mut dispatcher_config = config.dispatcher_config.clone();
    dispatcher_config.num_concurrent_processing_tasks = 1;

    // Build the dispatcher, which is what reads from the channel and dispatches txns
    // to the processor.
    let metadata_storage_clone = metadata_storage.clone();
    let dispatcher_task = tokio::spawn(async move {
        let mut dispatcher = Dispatcher {
            config: dispatcher_config,
            storage: metadata_storage_clone.clone(),
            processor: processor.clone(),
            receiver: channel_handle.receiver,
            starting_version,
        };
        let result = dispatcher.dispatch().await;
        eprintln!("Dispatcher finished unexpectedly: {:?}", result);
    });

    let task_handles = vec![dispatcher_task, channel_handle.join_handle];

    Ok(task_handles)
}
