use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use pixel_storage::PixelStorageTrait;
use poem::{
    get, handler,
    web::{Data, Path},
    Endpoint, EndpointExt, Response, Route,
};
use std::{str::FromStr, sync::Arc};

pub const BASE: &str = "/pixels";

#[handler]
async fn get_image(
    pixel_storage: Data<&Arc<dyn PixelStorageTrait>>,
    Path(address): Path<String>,
) -> poem::Result<Response> {
    let address = if address.ends_with(".png") {
        address[..address.len() - 4].to_string()
    } else {
        address
    };
    let address = Address::from_str(&address).context("Invalid address")?;
    let png_data = pixel_storage
        .get_canvas_as_png(&address)
        .await
        .with_context(|| {
            format!(
                "Failed to get image for address {}",
                address.to_canonical_string()
            )
        })
        .unwrap();
    Ok(Response::builder()
        .body(png_data)
        .set_content_type("image/png"))
}

#[handler]
async fn root() -> String {
    "Hello from the pixels API!!".to_string()
}

pub struct PixelApi {
    pixel_storage: Arc<dyn PixelStorageTrait>,
}

impl PixelApi {
    pub fn new(pixel_storage: Arc<dyn PixelStorageTrait>) -> Self {
        Self { pixel_storage }
    }

    pub fn get_route(self) -> Result<impl Endpoint> {
        Ok(Route::new()
            .at("/", get(root))
            .at("/:address", get(get_image))
            .data(self.pixel_storage.clone()))
    }
}
