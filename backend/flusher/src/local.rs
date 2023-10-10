use super::FlusherTrait;
use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use async_trait::async_trait;
use pixel_storage::PixelStorageTrait;
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Arc, time::Duration};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct LocalFlusherConfig {
    flush_dir: PathBuf,
    #[serde(default = "LocalFlusherConfig::default_flush_interval")]
    flush_interval: Duration,
}

impl LocalFlusherConfig {
    pub fn default_flush_interval() -> Duration {
        Duration::from_millis(3000)
    }
}

/// This is only intended for use in testing, it is not required in any of the main
/// deployment configurations, including for any approach related to serving images.
#[derive(Clone)]
pub struct LocalFlusher {
    config: LocalFlusherConfig,
    pixel_storage: Arc<dyn PixelStorageTrait>,
}

impl LocalFlusher {
    pub async fn new(
        config: LocalFlusherConfig,
        pixel_storage: Arc<dyn PixelStorageTrait>,
    ) -> Result<Self> {
        Ok(Self {
            config,
            pixel_storage,
        })
    }

    pub async fn write_image(&self, canvas_address: Address, png_data: Vec<u8>) -> Result<()> {
        let extension = "png";
        let filename = format!("images/{}.{}", canvas_address, extension);

        std::fs::write(self.config.flush_dir.join(filename), png_data)
            .context("Failed to write image to disk")?;

        Ok(())
    }
}

#[async_trait]
impl FlusherTrait for LocalFlusher {
    fn get_interval(&self) -> Duration {
        self.config.flush_interval
    }

    async fn flush(&self) -> Result<()> {
        let pngs = self.pixel_storage.get_canvases_as_pngs().await?;
        for (canvas_address, png_data) in pngs {
            self.write_image(canvas_address, png_data).await?;
        }
        Ok(())
    }
}
