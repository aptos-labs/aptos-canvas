mod memory;
mod postgres;

use anyhow::Result;
use aptos_move_graphql_scalars::Address;
pub use memory::MemoryMetadataStorage;
pub use postgres::{PostgresMetadataStorage, PostgresMetadataStorageConfig};
use std::fmt::Debug;

/// Handles creating, updating, and reading canvases.
#[async_trait::async_trait]
pub trait MetadataStorageTrait: Debug + Send + Sync + 'static {
    async fn update_attribution(&self, intent: UpdateAttributionIntent) -> Result<()>;
}

/// All the information necessary to update attribution in storage.
#[derive(Clone, Debug)]
pub struct UpdateAttributionIntent {
    /// The address of the object containing the canvas.
    pub canvas_address: Address,
    /// The address of the artist who wrote the pixel.
    pub artist_address: Address,
    /// The index of the pixel.
    pub index: u64,
    /// When the pixel was written.
    pub drawn_at_secs: u64,
}
