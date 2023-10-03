mod schema;

use anyhow::{Context, Result};
use async_graphql::{
    dataloader::DataLoader,
    http::{playground_source, GraphQLPlaygroundConfig},
};
use async_graphql_poem::GraphQL;
use metadata_storage::PostgresMetadataStorage;
use poem::{get, handler, web::Html, Endpoint, IntoResponse, Route};
use schema::{build_schema, OrmDataloader};
use std::sync::Arc;

const GQL_ENDPOINT: &str = "/gql";

#[handler]
async fn graphql_playground() -> impl IntoResponse {
    Html(playground_source(GraphQLPlaygroundConfig::new(
        GQL_ENDPOINT,
    )))
}

#[handler]
async fn root() -> String {
    "Hello from the metadata API!!".to_string()
}

pub struct MetadataApi {
    metadata_storage: Arc<PostgresMetadataStorage>,
}

impl MetadataApi {
    pub fn new(metadata_storage: Arc<PostgresMetadataStorage>) -> Self {
        Self { metadata_storage }
    }

    pub fn get_route(self) -> Result<impl Endpoint> {
        // Build the GraphQL stuff.
        let depth_limit = None;
        let complexity_limit = None;
        let connection = self.metadata_storage.connection.clone();
        let orm_dataloader: DataLoader<OrmDataloader> = DataLoader::new(
            OrmDataloader {
                db: connection.clone(),
            },
            tokio::spawn,
        );
        let schema = build_schema(connection, orm_dataloader, depth_limit, complexity_limit)
            .context("Failed to build schema")?;

        // Return the route.
        Ok(Route::new().at("/", get(root)).at(
            GQL_ENDPOINT,
            get(graphql_playground).post(GraphQL::new(schema)),
        ))
    }
}
