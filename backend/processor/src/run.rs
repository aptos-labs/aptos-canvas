//! Using these functions the dev can build and run all the components required to run
//! the processor. The dev could glue all these pieces together themselves, this file
//! doesn't use anything private, so this is all just for dev convenience / dedupe.

use crate::{CanvasProcessor, CanvasProcessorConfig};
use anyhow::{Context as AnyhowContext, Result};
use aptos_processor_framework::{
    CommonStorageConfig, Dispatcher, DispatcherConfig, GrpcStreamSubscriber,
    GrpcStreamSubscriberConfig, ProcessorTrait, StorageTrait, StreamSubscriberTrait,
};
use metadata_storage::{PostgresMetadataStorage, PostgresMetadataStorageConfig};
use pixel_storage::{MmapPixelStorage, MmapPixelStorageConfig};
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
    pub pixel_storage_config: MmapPixelStorageConfig,
    pub metadata_storage_config: PostgresMetadataStorageConfig,
}

/// Task handles and other things the caller might want, e.g. references to storage.
pub struct RunHandles {
    pub task_handles: Vec<JoinHandle<()>>,
    pub pixels_storage: Arc<MmapPixelStorage>,
    pub metadata_storage: Arc<PostgresMetadataStorage>,
}

/// Build all the relevant pieces required to run the processor, and the processor
/// itself, and spawn tokio tasks for them. This returns handles to those tasks.
pub async fn run(config: RunConfig) -> Result<RunHandles> {
    // Build pixels storage, which is what lets us read and write to the representation
    // of the canvas on disk.
    let pixels_storage = Arc::new(MmapPixelStorage::new(config.pixel_storage_config.clone()));

    // Build the metadata storage, which is what lets us read and write to the DB. This
    // is generally necessary for all processors since they need somewhere to at least
    // keep track of the last version they processed.
    let metadata_storage = Arc::new(
        PostgresMetadataStorage::new(config.metadata_storage_config.clone())
            .await
            .context("Failed to initialize Postgres storage")?,
    );

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

    // Build the dispatcher, which is what reads from the channel and dispatches txns
    // to the processor.
    let metadata_storage_clone = metadata_storage.clone();
    let dispatcher_task = tokio::spawn(async move {
        let mut dispatcher = Dispatcher {
            config: config.dispatcher_config.clone(),
            storage: metadata_storage_clone.clone(),
            processor: processor.clone(),
            receiver: channel_handle.receiver,
            starting_version,
        };
        let result = dispatcher.dispatch().await;
        eprintln!("Dispatcher finished unexpectedly: {:?}", result);
    });

    let task_handles = vec![dispatcher_task, channel_handle.join_handle];

    Ok(RunHandles {
        task_handles,
        pixels_storage,
        metadata_storage,
    })
}
