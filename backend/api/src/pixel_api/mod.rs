use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use pixel_storage::PixelStorageTrait;
use poem::{
    get, handler,
    web::{Data, Html, Path},
    Endpoint, EndpointExt, IntoResponse, Response, Route,
};
use std::{str::FromStr, sync::Arc};

const GQL_ENDPOINT: &str = "/gql";

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
async fn graphql_playground() -> impl IntoResponse {
    Html(playground_source(GraphQLPlaygroundConfig::new(
        GQL_ENDPOINT,
    )))
}

#[handler]
async fn root() -> String {
    "Hello from the pixel API!!".to_string()
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
