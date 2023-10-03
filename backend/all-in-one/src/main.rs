mod config;

use crate::config::{Args, Config};
use anyhow::{Context as AnyhowContext, Result};
use api::{build_full_route, start_api};
use aptos_processor_framework::{
    Dispatcher, GrpcStreamSubscriber, ProcessorTrait, StorageTrait, StreamSubscriberTrait,
};
use clap::Parser;
use metadata_storage::PostgresMetadataStorage;
use pixel_storage::MmapPixelStorage;
use processor::CanvasProcessor;
use std::sync::Arc;
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();
    let config = Config::try_from(args)?;

    let subscriber = FmtSubscriber::builder()
        // All spans of this level or more severe will be written to stdout.
        .with_max_level(Level::INFO)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .context("Setting default tracing subscriber failed")?;

    // Build canvas storage, which is what lets us read and write to the representation
    // of the canvas on disk.
    let canvas_storage = Arc::new(MmapPixelStorage::new(config.pixel_storage_config.clone()));

    // Build the storage, which is what lets us read and write to the DB. This is
    // generally necessary for all processors since they need somewhere to at least
    // keep track of the last version they processed.
    let db_storage = Arc::new(
        PostgresMetadataStorage::new(config.metadata_storage_config.clone())
            .await
            .context("Failed to initialize Postgres storage")?,
    );

    // Build the canvas processor, which is what processes transactions and updates the
    // canvas storage and the DB.
    let processor = Arc::new(CanvasProcessor::new(
        config.canvas_processor_config.clone(),
        canvas_storage.clone(),
        db_storage.clone(),
    ));

    // From the DB, read the last version we processed.
    let starting_version_from_db = db_storage
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
    // TODO: Idk if this should spawn a tokio worker, it should just return a
    // future that the caller and do whatever they want with.
    let channel_handle = stream_subscriber.start().await?;

    // Build the dispatcher, which is what reads from the channel and dispatches txns
    // to the processor.
    let db_storage_clone = db_storage.clone();
    let dispatcher_task = tokio::spawn(async move {
        let mut dispatcher = Dispatcher {
            config: config.dispatcher_config.clone(),
            storage: db_storage_clone.clone(),
            processor: processor.clone(),
            receiver: channel_handle.receiver,
            starting_version,
        };
        let result = dispatcher.dispatch().await;
        eprintln!("Dispatcher finished unexpectedly: {:?}", result);
    });

    // Build the API, which can serve the canvases as pngs and also serve any of the
    // restructured information the processor put in the DB.
    let route = build_full_route(Some(canvas_storage.clone()), Some(db_storage.clone()))?;
    let api_task = tokio::spawn(async move {
        let result = start_api(config.api_config.clone(), route).await;
        eprintln!("API finished unexpectedly: {:?}", result);
    });

    let tasks = vec![dispatcher_task, api_task, channel_handle.join_handle];
    let result = futures::future::select_all(tasks).await;

    Err(anyhow::anyhow!(
        "One of the futures finished unexpectedly: {:#?}",
        result
    ))
}
