use anyhow::Context as AnyhowContext;
use api::ApiConfig;
use clap::Parser;
use processor::RunConfig;
use serde::{Deserialize, Serialize};
use std::{fs::File, io::BufReader, path::PathBuf};

#[derive(Debug, Parser)]
pub struct Args {
    #[clap(long)]
    pub config_path: PathBuf,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub processor_config: RunConfig,
    pub api_config: ApiConfig,
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
        let run_config: Config = serde_yaml::from_reader(reader).with_context(|| {
            format!(
                "Failed to parse config at {}",
                args.config_path.to_string_lossy()
            )
        })?;
        Ok(run_config)
    }
}
