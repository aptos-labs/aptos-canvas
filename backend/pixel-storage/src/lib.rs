mod mmap;
mod utils;

use anyhow::Result;
use aptos_move_graphql_scalars::Address;
pub use mmap::{MmapPixelStorage, MmapPixelStorageConfig};
use move_types::Color;
use std::fmt::Debug;

/// Handles creating, updating, and reading canvases.
#[async_trait::async_trait]
pub trait PixelStorageTrait: Debug + Send + Sync + 'static {
    async fn create_canvas(&self, intent: CreateCanvasIntent) -> Result<()>;
    async fn write_pixel(&self, intent: WritePixelIntent) -> Result<()>;
    async fn get_canvas_as_png(&self, canvas_address: &Address) -> Result<Vec<u8>>;
}

/// All the information necessary to write a Pixel to storage.
#[derive(Clone, Debug)]
pub struct WritePixelIntent {
    /// The address of the object containing the canvas.
    pub canvas_address: Address,
    pub index: u64,
    pub color: Color,
}

/// All the information necessary to create a Canvas in storage.
#[derive(Clone, Debug)]
pub struct CreateCanvasIntent {
    /// The address of the object containing the canvas.
    pub canvas_address: Address,
    pub width: u64,
    pub height: u64,
    pub default_color: Color,
}
