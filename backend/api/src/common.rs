use crate::{MetadataApi, PixelApi};
use anyhow::{Context, Result};
use metadata_storage::PostgresMetadataStorage;
use pixel_storage::PixelStorageTrait;
use poem::{
    get, handler,
    http::Method,
    listener::TcpListener,
    middleware::{Cors, Tracing},
    EndpointExt, Route, Server,
};
use serde::{Deserialize, Serialize};
use std::{
    net::{Ipv4Addr, SocketAddrV4},
    sync::Arc,
};
use tracing::info;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
#[serde(default)]
pub struct ApiConfig {
    pub listen_address: SocketAddrV4,
}

impl Default for ApiConfig {
    fn default() -> Self {
        Self {
            listen_address: SocketAddrV4::new(Ipv4Addr::new(0, 0, 0, 0), 7645),
        }
    }
}

/// Attach the given routes to a server and start it.
pub async fn start_api(config: ApiConfig, route: Route) -> Result<()> {
    let cors = Cors::new().allow_methods(vec![Method::GET, Method::POST]);
    let route = route.with(cors).with(Tracing);
    info!("API starting at {}", config.listen_address);
    Server::new(TcpListener::bind(config.listen_address))
        .name("api")
        .run(route)
        .await
        .context("API server ended unexpectedly")
}

/// This convenience method helps with building an API with the desired routes based
/// on the APIs the user has built.
pub fn build_full_route(
    pixel_storage: Option<Arc<dyn PixelStorageTrait>>,
    metadata_storage: Option<Arc<PostgresMetadataStorage>>,
) -> Result<Route> {
    let mut route = Route::new().nest("/", get(v1_root));
    if let Some(pixel_storage) = pixel_storage {
        let pixel_api = PixelApi::new(pixel_storage);
        let pixel_route = pixel_api.get_route()?;
        route = route.nest(crate::pixel_api::BASE, pixel_route);
    }
    if let Some(metadata_storage) = metadata_storage {
        let metadata_api = MetadataApi::new(metadata_storage);
        let metadata_route = metadata_api.get_route()?;
        route = route.nest(crate::metadata_api::BASE, metadata_route);
    }
    // Nest everything under /v1
    Ok(Route::new().at("/", get(root)).nest("/v1", route))
}

#[handler]
async fn root() -> String {
    "Hello from the root!! Try querying /v1, e.g. /v1/pixels or /v1/metadata 🤠".to_string()
}

#[handler]
async fn v1_root() -> String {
    "Hello from the root at /v1!!".to_string()
}
