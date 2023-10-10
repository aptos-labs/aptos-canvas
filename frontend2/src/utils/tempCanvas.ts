/** Creates a temporary canvas containing a square image */
export function createTempCanvas(pixelArray: Uint8ClampedArray, size: number) {
  // Initialize a new ImageData object
  const imageData = new ImageData(pixelArray, size, size);

  // Create a temporary canvas
  let tempCanvas: HTMLCanvasElement | null = document.createElement("canvas");
  tempCanvas.setAttribute("id", "_temp_canvas");
  tempCanvas.width = size;
  tempCanvas.height = size;

  // Write image data to temporary canvas
  tempCanvas.getContext("2d")?.putImageData(imageData, 0, 0);

  /** Delete the temporary canvas */
  const cleanUp = () => {
    tempCanvas = null;
    document.getElementById("#_temp_canvas")?.remove();
  };

  return [tempCanvas, cleanUp] as const;
}

/** Gets pixel array from a square HTML image element via a temporary canvas */
export function getPixelArrayFromImageElement(image: HTMLImageElement, size: number) {
  let tempCanvas: HTMLCanvasElement | null = document.createElement("canvas");
  tempCanvas.setAttribute("id", "_temp_canvas");
  tempCanvas.width = size;
  tempCanvas.height = size;
  const context = tempCanvas.getContext("2d");
  context?.drawImage(image, 0, 0);
  const imageData = context?.getImageData(0, 0, size, size);

  const pixelArray = imageData?.data;

  /** Delete the temporary canvas when done using the pixel array */
  const cleanUp = () => {
    tempCanvas = null;
    document.getElementById("#_temp_canvas")?.remove();
  };

  return [pixelArray, cleanUp] as const;
}
