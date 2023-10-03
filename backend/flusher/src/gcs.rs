use super::FlusherTrait;
use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use async_trait::async_trait;
use google_cloud_storage::{
    client::{Client, ClientConfig},
    http::objects::upload::{Media, UploadObjectRequest, UploadType},
};
use pixel_storage::PixelStorageTrait;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct GcsFlusherConfig {
    bucket_name: String,
}

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
        let upload_type = UploadType::Simple(Media {
            name: filename.clone().into(),
            content_type: format!("image/{}", extension).into(),
            content_length: Some(png_data.len() as u64),
        });
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
    async fn flush(&self) -> Result<()> {
        let pngs = self.pixel_storage.get_canvases_as_pngs().await?;
        for (canvas_address, png_data) in pngs {
            self.write_image_to_gcs(canvas_address, png_data).await?;
        }
        Ok(())
    }
}
