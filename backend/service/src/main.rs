mod config;

// This crate combines three different modes of operation for the sake of convenience:
// 1. All in one: Run the processor and API in the same machine.
// 2. Processor: Run the processor only.
// 3. Metadata API: Run the metadata API only.

use crate::config::{Args, Config};
use anyhow::{Context as AnyhowContext, Result};
use api::{build_full_route, start_api};
use clap::Parser;
use flusher::{FlusherTrait, GcsFlusher};
use metadata_storage::PostgresMetadataStorage;
use pixel_storage::MmapPixelStorage;
use processor::run;
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

    let tasks = match config {
        Config::AllInOne(config) => {
            // Build pixels storage, which is what lets us read and write to the
            // representation of the canvas on disk.
            let pixels_storage =
                Arc::new(MmapPixelStorage::new(config.pixel_storage_config.clone()));

            // Build the metadata storage, which is what lets us read and write to the
            // DB. This is generally necessary for all processors since they need
            // somewhere to at least keep track of the last version they processed.
            let metadata_storage = Arc::new(
                PostgresMetadataStorage::new(config.metadata_storage_config.clone())
                    .await
                    .context("Failed to initialize Postgres storage")?,
            );

            // Run the processor. This returns handles to the processor tasks.
            let mut tasks = run(
                config.processor_config,
                metadata_storage.clone(),
                pixels_storage.clone(),
            )
            .await?;

            // Run the API.
            let route =
                build_full_route(Some(pixels_storage.clone()), Some(metadata_storage.clone()))?;
            let api_task = tokio::spawn(async move {
                let result = start_api(config.api_config, route).await;
                eprintln!("API finished unexpectedly: {:?}", result);
            });

            // Return all the tasks.
            tasks.push(api_task);
            tasks
        },
        Config::ProcessorOnly(config) => {
            let pixels_storage =
                Arc::new(MmapPixelStorage::new(config.pixel_storage_config.clone()));
            let metadata_storage = Arc::new(
                PostgresMetadataStorage::new(config.metadata_storage_config.clone())
                    .await
                    .context("Failed to initialize Postgres storage")?,
            );
            let mut tasks = run(
                config.processor_config,
                metadata_storage,
                pixels_storage.clone(),
            )
            .await?;
            let gcs_flusher =
                GcsFlusher::new(config.gcs_flusher.clone(), pixels_storage.clone()).await?;
            let gcs_flusher_task = gcs_flusher.run();
            tasks.push(gcs_flusher_task);
            tasks
        },
        Config::MetadataApiOnly(config) => {
            let metadata_storage = Arc::new(
                PostgresMetadataStorage::new(config.metadata_storage_config.clone())
                    .await
                    .context("Failed to initialize Postgres storage")?,
            );
            let route = build_full_route(None, Some(metadata_storage.clone()))?;
            let api_task = tokio::spawn(async move {
                let result = start_api(config.api_config, route).await;
                eprintln!("API finished unexpectedly: {:?}", result);
            });
            vec![api_task]
        },
    };

    // Wait for all the tasks.
    let result = futures::future::select_all(tasks).await;

    Err(anyhow::anyhow!(
        "One of the futures finished unexpectedly: {:#?}",
        result
    ))
}
