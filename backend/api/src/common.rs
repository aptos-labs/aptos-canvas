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
pub struct ApiConfig {
    #[serde(default = "ApiConfig::default_listen_address")]
    pub listen_address: SocketAddrV4,
}

impl ApiConfig {
    pub fn default_listen_address() -> SocketAddrV4 {
        SocketAddrV4::new(Ipv4Addr::new(0, 0, 0, 0), 7645)
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

#[handler]
async fn root() -> String {
    "Hello from the root!!".to_string()
}

/// This convenience method helps with building an API with the desired routes based
/// on the APIs the user has built.
pub fn build_full_route(
    pixel_storage: Option<Arc<dyn PixelStorageTrait>>,
    metadata_storage: Option<Arc<PostgresMetadataStorage>>,
) -> Result<Route> {
    let mut route = Route::new().at("/", get(root));
    if let Some(pixel_storage) = pixel_storage {
        let pixel_api = PixelApi::new(pixel_storage);
        let pixel_route = pixel_api.get_route()?;
        route = route.at("/pixel", pixel_route);
    }
    if let Some(metadata_storage) = metadata_storage {
        let metadata_api = MetadataApi::new(metadata_storage);
        let metadata_route = metadata_api.get_route()?;
        route = route.at("/metadata", metadata_route);
    }
    Ok(route)
}
