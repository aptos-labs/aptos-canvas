mod config;

use crate::config::{Args, Config};
use anyhow::{Context as AnyhowContext, Result};
use api::{build_full_route, start_api};
use clap::Parser;
use processor::{run, RunHandles};
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

    let Config {
        processor_config,
        api_config,
    } = config;

    let RunHandles {
        task_handles: processor_tasks,
        pixels_storage,
        metadata_storage,
    } = run(processor_config).await?;

    // Build the API, which can serve the canvases as pngs and also serve any of the
    // restructured information the processor put in the DB.
    let route = build_full_route(Some(pixels_storage.clone()), Some(metadata_storage.clone()))?;
    let api_task = tokio::spawn(async move {
        let result = start_api(api_config.clone(), route).await;
        eprintln!("API finished unexpectedly: {:?}", result);
    });

    let mut tasks = processor_tasks;
    tasks.push(api_task);
    let result = futures::future::select_all(tasks).await;

    Err(anyhow::anyhow!(
        "One of the futures finished unexpectedly: {:#?}",
        result
    ))
}
