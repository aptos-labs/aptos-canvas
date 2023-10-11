use super::FlusherTrait;
use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use async_trait::async_trait;
use google_cloud_storage::{
    client::{Client, ClientConfig},
    http::objects::{
        upload::{UploadObjectRequest, UploadType},
        Object,
    },
};
use pixel_storage::PixelStorageTrait;
use serde::{Deserialize, Serialize};
use std::{sync::Arc, time::Duration};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct GcsFlusherConfig {
    bucket_name: String,
    #[serde(default = "GcsFlusherConfig::default_flush_interval")]
    flush_interval: Duration,
}

impl GcsFlusherConfig {
    pub fn default_flush_interval() -> Duration {
        Duration::from_millis(1200)
    }
}

/// This assumes that we're running inside GCP. If we're not then this won't work
/// because we use ClientConfig::default().with_auth() to create the client.
#[derive(Clone)]
pub struct GcsFlusher {
    config: GcsFlusherConfig,
    pixel_storage: Arc<dyn PixelStorageTrait>,
    client: Client,
}

impl GcsFlusher {
    pub async fn new(
        config: GcsFlusherConfig,
        pixel_storage: Arc<dyn PixelStorageTrait>,
    ) -> Result<Self> {
        let client_config = ClientConfig::default()
            .with_auth()
            .await
            .context("Failed to create GCP GCS client config")?;
        let client = Client::new(client_config);
        Ok(Self {
            config,
            pixel_storage,
            client,
        })
    }

    pub async fn write_image_to_gcs(
        &self,
        canvas_address: Address,
        png_data: Vec<u8>,
    ) -> Result<()> {
        let extension = "png";

        let filename = format!("images/{}.{}", canvas_address, extension);
        // We can't use uploadType::Simple because it doesn't allow us to set the cache
        // control parameters.
        let upload_type = UploadType::Multipart(Box::new(Object {
            name: filename.clone(),
            content_type: format!("image/{}", extension).into(),
            size: png_data.len() as i64,
            // Don't let the content be cached anywhere.
            cache_control: Some("no-cache, no-store, max-age=0".to_string()),
            ..Default::default()
        }));
        self.client
            .upload_object(
                &UploadObjectRequest {
                    bucket: self.config.bucket_name.clone(),
                    ..Default::default()
                },
                png_data.clone(),
                &upload_type,
            )
            .await
            .with_context(|| format!("Failed to image for address {} to GCS", canvas_address))?;

        Ok(())
    }
}

#[async_trait]
impl FlusherTrait for GcsFlusher {
    fn get_interval(&self) -> Duration {
        self.config.flush_interval
    }

    async fn flush(&self) -> Result<()> {
        let pngs = self.pixel_storage.get_canvases_as_pngs().await?;
        for (canvas_address, png_data) in pngs {
            // This could be optimized by only writing images that have changed.
            self.write_image_to_gcs(canvas_address, png_data).await?;
        }
        Ok(())
    }
}
