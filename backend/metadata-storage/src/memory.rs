use super::{MetadataStorageTrait, UpdateAttributionIntent};
use anyhow::Result;
use aptos_processor_framework::StorageTrait;
use std::sync::Arc;
use tokio::sync::Mutex;

/// An in-memory, transient storage implementation.
#[derive(Debug)]
pub struct MemoryMetadataStorage {
    chain_id: Arc<Mutex<Option<u8>>>,
    last_processed_version: Arc<Mutex<Option<u64>>>,
}

impl MemoryMetadataStorage {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self {
            chain_id: Arc::new(Mutex::new(None)),
            last_processed_version: Arc::new(Mutex::new(None)),
        }
    }
}

impl Default for MemoryMetadataStorage {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait::async_trait]
impl StorageTrait for MemoryMetadataStorage {
    async fn read_chain_id(&self) -> Result<Option<u8>> {
        Ok(*self.chain_id.lock().await)
    }

    async fn write_chain_id(&self, chain_id: u8) -> Result<()> {
        *self.chain_id.lock().await = Some(chain_id);
        Ok(())
    }

    async fn read_last_processed_version(&self, _processor_name: &str) -> Result<Option<u64>> {
        Ok(*self.last_processed_version.lock().await)
    }

    async fn write_last_processed_version(
        &self,
        _processor_name: &str,
        version: u64,
    ) -> Result<()> {
        *self.last_processed_version.lock().await = Some(version);
        Ok(())
    }
}

#[async_trait::async_trait]
impl MetadataStorageTrait for MemoryMetadataStorage {
    async fn update_attribution(&self, _intent: UpdateAttributionIntent) -> Result<()> {
        Ok(())
    }
}
