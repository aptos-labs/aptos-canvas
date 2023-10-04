use anyhow::Context as AnyhowContext;
use api::ApiConfig;
use clap::Parser;
use flusher::GcsFlusherConfig;
use metadata_storage::PostgresMetadataStorageConfig;
use pixel_storage::MmapPixelStorageConfig;
use processor::RunConfig;
use serde::{Deserialize, Serialize};
use std::{fs::File, io::BufReader, path::PathBuf};

#[derive(Debug, Parser)]
pub struct Args {
    #[clap(short, long)]
    pub config_path: PathBuf,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[serde(deny_unknown_fields)]
pub enum Config {
    AllInOne(AllInOneConfig),
    ProcessorOnly(ProcessorOnlyConfig),
    MetadataApiOnly(MetadataApiOnlyConfig),
}

impl TryFrom<Args> for Config {
    type Error = anyhow::Error;

    fn try_from(args: Args) -> Result<Self, Self::Error> {
        let file = File::open(&args.config_path).with_context(|| {
            format!(
                "Failed to load config at {}",
                args.config_path.to_string_lossy()
            )
        })?;
        let reader = BufReader::new(file);
        let run_config: Self = serde_yaml::from_reader(reader).with_context(|| {
            format!(
                "Failed to parse config at {}",
                args.config_path.to_string_lossy()
            )
        })?;
        Ok(run_config)
    }
}

/// Config for running the processor and API all in one. This is how we did it in
/// banool/aptos-canvas and for the hackathon edition of Graffio.
#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct AllInOneConfig {
    pub processor_config: RunConfig,
    pub pixel_storage_config: MmapPixelStorageConfig,
    pub metadata_storage_config: PostgresMetadataStorageConfig,
    pub api_config: ApiConfig,
}

/// Config for running just the processor.
#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct ProcessorOnlyConfig {
    pub processor_config: RunConfig,
    pub pixel_storage_config: MmapPixelStorageConfig,
    pub metadata_storage_config: PostgresMetadataStorageConfig,
    pub gcs_flusher: GcsFlusherConfig,
}

/// Config for running just the metadata storage and metadata API. In this setup
/// it is expected that serving pixel data is handled elsewhere. Generally this
/// means that the processor is running somewhere else and using the GcsFlusher.
#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct MetadataApiOnlyConfig {
    pub metadata_storage_config: PostgresMetadataStorageConfig,
    pub api_config: ApiConfig,
}
