use anyhow::Context as AnyhowContext;
use api::ApiConfig;
use clap::Parser;
use figment::{
    providers::{Env, Format, Yaml},
    Figment,
};
use flusher::{GcsFlusherConfig, LocalFlusherConfig};
use metadata_storage::PostgresMetadataStorageConfig;
use pixel_storage::MmapPixelStorageConfig;
use processor::RunConfig;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

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

    /// This function uses Figment to read the config. In short, it reads the config
    /// first from the file and then environment variables.
    ///
    /// You can override (or set, if it wasn't set in the first place), a value
    /// in the config field with by setting an environment variable. First, to do this
    /// you need to set the appropriate prefix, so you must prefix your env vars with
    /// GRAFFIO___. Now, to override a nested config field you need to "nest" the env
    /// var key with `___`. For example, if you wanted to set connection_string in
    /// PostgresMetadataStorageConfig you would have to use the following key:
    ///
    /// GRAFFIO___METADATA_STORAGE_CONFIG___CONNECTION_STRING
    ///
    /// So if you had a config file that completely leaves out this section:
    ///
    /// metadata_storage_config:
    ///   connection_string: "postgres://dport@127.0.0.1:5432/postgres"
    ///
    /// You could set that whole "path" with this env var:
    ///
    /// GRAFFIO___METADATA_STORAGE_CONFIG___CONNECTION_STRING=postgres://dport@localhost:5432/postgres
    fn try_from(args: Args) -> Result<Self, Self::Error> {
        Figment::new()
            .merge(Yaml::file(args.config_path))
            .merge(Env::prefixed("GRAFFIO___").split("___"))
            .extract()
            .context("Failed to load config")
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
    // For testing purposes you may choose to also run a LocalFlusher.
    pub local_flusher_config: Option<LocalFlusherConfig>,
}

/// Config for running just the processor.
#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct ProcessorOnlyConfig {
    pub processor_config: RunConfig,
    pub pixel_storage_config: MmapPixelStorageConfig,
    pub metadata_storage_config: PostgresMetadataStorageConfig,
    // We take these params to know where to run the API but in main.rs we don't
    // actually hook up the pixel or metadata APIs, we only run the root API so
    // we can respond to health checks.
    pub api_config: ApiConfig,
    pub gcs_flusher_config: GcsFlusherConfig,
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
