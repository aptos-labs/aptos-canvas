use super::{MetadataStorageTrait, UpdateAttributionIntent};
use anyhow::{Context, Result};
use aptos_processor_framework::StorageTrait;
use entities::{chain_id, last_processed_version, pixel_attribution};
use migrations::{Migrator, MigratorTrait};
use sea_orm::{
    sea_query::OnConflict, ConnectionTrait, Database, DatabaseConnection, DbBackend, EntityTrait,
    QueryTrait,
};
use serde::{Deserialize, Serialize};
use tracing::info;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PostgresMetadataStorageConfig {
    pub connection_string: String,
}

#[derive(Debug)]
pub struct PostgresMetadataStorage {
    pub connection: DatabaseConnection,
}

impl PostgresMetadataStorage {
    pub async fn new(config: PostgresMetadataStorageConfig) -> Result<Self> {
        // Build the DB connection.
        let connection = Database::connect(&config.connection_string)
            .await
            .context("Failed to connect to DB")?;

        // Apply migrations if necessary.
        Migrator::up(&connection, None)
            .await
            .context("Failed to apply migrations")?;

        info!("Built postgresql storage");

        Ok(Self { connection })
    }
}

#[async_trait::async_trait]
impl MetadataStorageTrait for PostgresMetadataStorage {
    async fn update_attribution(&self, intent: UpdateAttributionIntent) -> Result<()> {
        let new_attribution = pixel_attribution::ActiveModel {
            index: sea_orm::Set(intent.index as i64),
            canvas_address: sea_orm::Set(intent.canvas_address.to_string()),
            artist_address: sea_orm::Set(intent.artist_address.to_string()),
            drawn_at_secs: sea_orm::Set(intent.drawn_at_secs as i64),
        };

        let query = pixel_attribution::Entity::insert(new_attribution)
            .on_conflict(
                OnConflict::columns(vec![
                    pixel_attribution::Column::Index,
                    pixel_attribution::Column::CanvasAddress,
                ])
                .value(pixel_attribution::Column::Index, intent.index as i64)
                .value(
                    pixel_attribution::Column::CanvasAddress,
                    intent.canvas_address.to_string(),
                )
                .value(
                    pixel_attribution::Column::ArtistAddress,
                    intent.artist_address.to_string(),
                )
                .value(
                    pixel_attribution::Column::DrawnAtSecs,
                    intent.drawn_at_secs as i64,
                )
                .to_owned(),
            )
            .build(DbBackend::Postgres);

        self.connection
            .execute(query)
            .await
            .context("Failed to update attribution")?;

        Ok(())
    }
}

#[async_trait::async_trait]
impl StorageTrait for PostgresMetadataStorage {
    async fn read_chain_id(&self) -> Result<Option<u8>> {
        Ok(chain_id::Entity::find()
            .one(&self.connection)
            .await
            .context("Failed to read ChainId")?
            .map(|chain_id| chain_id.chain_id as u8))
    }

    async fn write_chain_id(&self, chain_id: u8) -> Result<()> {
        let new_chain_id = chain_id::ActiveModel {
            chain_id: sea_orm::Set(chain_id as i16),
        };

        let query = chain_id::Entity::insert(new_chain_id)
            .on_conflict(
                OnConflict::column(chain_id::Column::ChainId)
                    .value(chain_id::Column::ChainId, chain_id)
                    .to_owned(),
            )
            .build(DbBackend::Postgres);

        self.connection
            .execute(query)
            .await
            .context("Failed to update chain ID")?;

        Ok(())
    }

    async fn read_last_processed_version(&self, processor_name: &str) -> Result<Option<u64>> {
        Ok(last_processed_version::Entity::find_by_id(processor_name)
            .one(&self.connection)
            .await
            .context("Failed to read last processed version")?
            .map(|lpv| lpv.version as u64))
    }

    async fn write_last_processed_version(&self, processor_name: &str, version: u64) -> Result<()> {
        let new_last_processed_version = last_processed_version::ActiveModel {
            processor_name: sea_orm::Set(processor_name.to_string()),
            version: sea_orm::Set(version as i64),
        };

        let query = last_processed_version::Entity::insert(new_last_processed_version)
            .on_conflict(
                OnConflict::column(last_processed_version::Column::ProcessorName)
                    .update_column(last_processed_version::Column::ProcessorName)
                    .value(last_processed_version::Column::Version, version)
                    .to_owned(),
            )
            .build(DbBackend::Postgres);

        self.connection
            .execute(query)
            .await
            .context("Failed to update last processed version")?;

        Ok(())
    }
}
