use super::{utils::get_image, CreateCanvasIntent, PixelStorageTrait, WritePixelIntent};
use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use dashmap::DashMap;
use memmap2::MmapMut;
use move_types::Color;
use serde::{Deserialize, Serialize};
use std::{
    fs::{File, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
};

// There could be an alternate implementation where instead of using the mmap, for
// every pixel we read the png, update the pixel, and write the png back to disk.
// This would be slower and result in more disk IO but use less storage and memory.

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct MmapPixelStorageConfig {
    pub storage_directory: PathBuf,
}

/// Handles creating, updating, and reading canvases.
#[derive(Debug)]
pub struct MmapPixelStorage {
    config: MmapPixelStorageConfig,
    mmaps: DashMap<Address, MmapMut>,
}

impl MmapPixelStorage {
    pub fn new(config: MmapPixelStorageConfig) -> Self {
        Self {
            config,
            mmaps: DashMap::new(),
        }
    }

    fn get_filename(&self, canvas_address: &Address) -> PathBuf {
        Path::new(&self.config.storage_directory)
            .join(format!("0x{}.canvas", canvas_address.to_canonical_string()))
    }
}

#[async_trait::async_trait]
impl PixelStorageTrait for MmapPixelStorage {
    /// Create a canvas as a file on disk. We use a custom format where each pixel is
    /// stored as 3 bytes (r, g, b) and the width and height are stored at the end of
    /// the file as 8 bytes each.
    async fn create_canvas(&self, intent: CreateCanvasIntent) -> Result<()> {
        let mut file = File::create(self.get_filename(&intent.canvas_address))?;

        // Calculate the total number of pixels
        let num_pixels = intent.width * intent.height;

        // Build all the data into a single vector.
        let mut data = Vec::with_capacity(num_pixels as usize * 3);
        for _ in 0..num_pixels {
            data.push(intent.default_color.r);
            data.push(intent.default_color.g);
            data.push(intent.default_color.b);
        }

        // Put the width and height at the end of the file.
        data.extend(intent.width.to_le_bytes());
        data.extend(intent.height.to_le_bytes());

        // Write the data to the file.
        file.write_all(&data)?;

        Ok(())
    }

    async fn write_pixel(&self, intent: WritePixelIntent) -> Result<()> {
        // Get an existing mmap for the canvas file or initialize a new one.
        let mut mmap = self.mmaps.entry(intent.canvas_address).or_insert_with(|| {
            let filename = self.get_filename(&intent.canvas_address);
            let file = OpenOptions::new()
                .read(true)
                .write(true)
                .create(false)
                .open(&filename)
                .unwrap_or_else(|_| panic!("Failed to open file {}", filename.display()));
            unsafe { MmapMut::map_mut(&file).expect("Failed to mmap file") }
        });

        // Write the pixel to the file through the mmap.
        let index = intent.index as usize;
        mmap[index * 3] = intent.color.r;
        mmap[index * 3 + 1] = intent.color.g;
        mmap[index * 3 + 2] = intent.color.b;

        // TEMPORARY FOR TESTING. Write the data as a png.
        drop(mmap);
        let png_bytes = self.get_canvas_as_png(&intent.canvas_address).await?;
        let mut file = File::create("/tmp/test.png")?;
        file.write_all(&png_bytes)?;

        Ok(())
    }

    async fn get_canvas_as_png(&self, canvas_address: &Address) -> Result<Vec<u8>> {
        let mmap = self.mmaps.entry(*canvas_address).or_insert_with(|| {
            let file = OpenOptions::new()
                .read(true)
                .write(true)
                .create(false)
                .open(self.get_filename(canvas_address))
                .expect("Failed to open file");
            unsafe { MmapMut::map_mut(&file).expect("Failed to mmap file") }
        });

        // Get the width and height from the end of the file.
        let (width, height) =
            read_width_and_height(&mmap).context("Failed to read width and height")?;

        // Read the data from the file as a vector of Colors.
        let mut data = Vec::with_capacity((width * height) as usize);
        for i in 0..width * height {
            let index = i as usize;
            data.push(Color {
                r: mmap[index * 3],
                g: mmap[index * 3 + 1],
                b: mmap[index * 3 + 2],
            });
        }

        // Convert the data to a png.
        let png = get_image(data, width as u32, height as u32)
            .context("Failed to convert data to a png")?;

        Ok(png)
    }
}

/// Read the width and height from the end of the file.
fn read_width_and_height(mmap: &MmapMut) -> Result<(u64, u64)> {
    let len = mmap.len();
    if len < 16 {
        anyhow::bail!("File is too short to contain width and height");
    }

    let width_bytes: [u8; 8] = mmap[len - 16..len - 8]
        .try_into()
        .context("Failed to read width")?;
    let height_bytes: [u8; 8] = mmap[len - 8..len]
        .try_into()
        .context("Failed to read height")?;

    let width = u64::from_le_bytes(width_bytes);
    let height = u64::from_le_bytes(height_bytes);

    Ok((width, height))
}
