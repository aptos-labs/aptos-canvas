use anyhow::{Context, Result};
use image::{codecs::png::PngEncoder, ColorType, ImageBuffer, ImageEncoder, Rgb};
use move_types::Color;

/// Convert a vector of Colors to a png.
pub fn get_image(pixels: Vec<Color>, width: u32, height: u32) -> Result<Vec<u8>> {
    let mut image_buffer = ImageBuffer::new(width, height);

    for (x, y, pixel) in image_buffer.enumerate_pixels_mut() {
        let color = &pixels[(y * width + x) as usize];
        *pixel = Rgb([color.r, color.g, color.b]);
    }

    // Create a buffer to hold the png
    let mut buffer: Vec<u8> = Vec::new();

    // Create a PNG encoder
    let encoder = PngEncoder::new(&mut buffer);

    // Write the image_buffer data to the buffer as PNG
    encoder
        .write_image(&image_buffer.into_raw(), width, height, ColorType::Rgb8)
        .context("Failed to create png")?;

    Ok(buffer)
}
