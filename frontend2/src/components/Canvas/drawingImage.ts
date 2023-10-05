import { fabric } from "fabric";
import { IImageOptions } from "fabric/fabric-impl";

import { useCanvasState } from "@/contexts/canvas";

import { EventCanvas } from "./types";

export function createSquareOfWhitePixels(size: number): Uint8ClampedArray {
  const pixelArray = new Uint8ClampedArray(size * size * 4);

  for (let i = 0; i < pixelArray.length; i += 4) {
    pixelArray[i + 0] = 255; // R value
    pixelArray[i + 1] = 255; // G value
    pixelArray[i + 2] = 255; // B value
    pixelArray[i + 3] = 255; // A value
  }

  return pixelArray;
}

export interface CreateImageArgs {
  size: number;
  pixelArray: Uint8ClampedArray;
  canvas: fabric.Canvas;
  imageRef?: React.MutableRefObject<fabric.Image | undefined>;
}

export function createSquareImage({ size, pixelArray, canvas, imageRef }: CreateImageArgs) {
  let tempCanvas: HTMLCanvasElement | null = document.createElement("canvas");

  tempCanvas.setAttribute("id", "_temp_canvas");
  tempCanvas.width = size;
  tempCanvas.height = size;

  // Initialize a new ImageData object
  const imageData = new ImageData(pixelArray, size, size);

  // Write image data to temporary canvas
  tempCanvas.getContext("2d")?.putImageData(imageData, 0, 0);

  const canvasHeight = canvas.getHeight();
  const canvasWidth = canvas.getWidth();
  const minCanvas = Math.min(canvasHeight, canvasWidth);

  fabric.Image.fromURL(
    tempCanvas.toDataURL(),
    function (img) {
      img.left = 0;
      img.top = 0;

      // Scale image to fit canvas
      img.scaleToHeight(minCanvas);
      img.scaleToWidth(minCanvas);

      // Add image to canvas
      canvas.add(img);
      img.sendToBack();

      // Save image to ref if provided
      if (imageRef) imageRef.current = img;

      // Clean up temporary canvas
      tempCanvas = null;
      document.getElementById("#_temp_canvas")?.remove();
    },
    // The types for this package are out of date so I had to do some type-casting
    { selectable: false, imageSmoothing: false, objectCaching: false } as IImageOptions,
  );
}

export interface AlterImagePixelsArgs {
  image: fabric.Image;
  size: number;
  pixelArray: Uint8ClampedArray;
  canvas: EventCanvas;
  event: MouseEvent;
}

export function alterImagePixels({ image, size, pixelArray, canvas, event }: AlterImagePixelsArgs) {
  let c: HTMLCanvasElement | null = document.createElement("canvas");
  c.setAttribute("id", "_temp_canvas");
  c.width = size;
  c.height = size;

  // Get the initial current scaling of the image. It doesn't matter if we use scaleX or scaleY
  // since the image is a square
  const imageScale = image.getObjectScaling().scaleX;

  const zoom = canvas.getZoom();
  const panX = canvas.viewportTransform?.[4];
  const panY = canvas.viewportTransform?.[5];

  const scalePosition = (position: number) => Math.floor(position / imageScale / zoom);

  const coords = getAffectedCoordinates(
    scalePosition(event.offsetX - (panX ?? 0)),
    scalePosition(event.offsetY - (panY ?? 0)),
    scalePosition(event.movementX),
    scalePosition(event.movementY),
    // Filter out-of-bounds coordinates
  ).filter(({ x, y }) => x >= 0 && x < size && y >= 0 && y < size);

  const { strokeColor, pixelsChanged } = useCanvasState.getState();
  const nextPixelsChanged = { ...pixelsChanged };

  for (const coord of coords) {
    nextPixelsChanged[`${coord.x}-${coord.y}`] = strokeColor.value;
    const index = (coord.y * size + coord.x) * 4;
    pixelArray[index + 0] = strokeColor.red; // R value
    pixelArray[index + 1] = strokeColor.green; // G value
    pixelArray[index + 2] = strokeColor.blue; // B value
    pixelArray[index + 3] = 255; // A value
  }

  // Initialize a new ImageData object
  const imageData = new ImageData(pixelArray, size, size);

  c.getContext("2d")?.putImageData(imageData, 0, 0);

  image.setSrc(c.toDataURL(), () => {
    canvas.renderAll();
    c = null;
    document.getElementById("#_temp_canvas")?.remove();
  });
  useCanvasState.setState({ pixelsChanged: nextPixelsChanged });
}

function getAffectedCoordinates(
  offsetX: number,
  offsetY: number,
  movementX: number,
  movementY: number,
) {
  const coordinates = [];

  // Push the initial position to the array
  coordinates.push({ x: offsetX, y: offsetY });

  // Sometimes movement values are 1 or -1 even though a full pixel hasn't been covered yet
  if (Math.abs(movementX) < 2 || Math.abs(movementY) < 2) return coordinates;

  // Calculate all intermediate positions based on movementX and movementY
  while (Math.abs(movementX) > 0 || Math.abs(movementY) > 0) {
    // Push the next position to the array
    coordinates.push({ x: offsetX + movementX, y: offsetY + movementY });

    // Reduce movementX and movementY towards zero
    if (movementX > 0) movementX--;
    else if (movementX < 0) movementX++;

    if (movementY > 0) movementY--;
    else if (movementY < 0) movementY++;
  }

  return coordinates;
}
