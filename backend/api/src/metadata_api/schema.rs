use async_graphql::{dataloader::DataLoader, dynamic::*};
use entities::*;
use once_cell::sync::Lazy;
use sea_orm::DatabaseConnection;
use seaography::{Builder, BuilderContext};

static BUILDER_CONTEXT: Lazy<BuilderContext> = Lazy::new(BuilderContext::default);

pub struct OrmDataloader {
    pub db: DatabaseConnection,
}

pub fn build_schema(
    database: DatabaseConnection,
    orm_dataloader: DataLoader<OrmDataloader>,
    depth: Option<usize>,
    complexity: Option<usize>,
) -> Result<Schema, SchemaError> {
    let mut builder = Builder::new(&BUILDER_CONTEXT);
    seaography::register_entities!(builder, [
        chain_id,
        last_processed_version,
        pixel_attribution,
    ]);
    let schema = builder.schema_builder();
    let schema = if let Some(depth) = depth {
        schema.limit_depth(depth)
    } else {
        schema
    };
    let schema = if let Some(complexity) = complexity {
        schema.limit_complexity(complexity)
    } else {
        schema
    };
    schema.data(database).data(orm_dataloader).finish()
}
