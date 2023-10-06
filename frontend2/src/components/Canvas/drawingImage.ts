import { fabric } from "fabric";
import { IImageOptions } from "fabric/fabric-impl";

import { useCanvasState } from "@/contexts/canvas";

import { EventCanvas, Point } from "./types";

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
  point1: Point;
  point2: Point;
}

export function alterImagePixels({
  image,
  size,
  pixelArray,
  canvas,
  point1,
  point2,
}: AlterImagePixelsArgs) {
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

  const scalePosition = (position: number) => {
    const newPos = position / imageScale / zoom;
    return newPos < 0 ? Math.ceil(newPos) : Math.floor(newPos);
  };

  const scalePoint = (point: Point) => ({
    x: scalePosition(point.x - (panX ?? 0)),
    y: scalePosition(point.y - (panY ?? 0)),
  });

  const points = getContinuousPoints(scalePoint(point1), scalePoint(point2)).filter(
    ({ x, y }) => x >= 0 && x < size && y >= 0 && y < size,
  );

  const { strokeColor, pixelsChanged } = useCanvasState.getState();
  const nextPixelsChanged = { ...pixelsChanged };

  for (const point of points) {
    nextPixelsChanged[`${point.x}-${point.y}`] = strokeColor.value;
    const index = (point.y * size + point.x) * 4;
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

/**
 * Use a variation of Bresenham's line algorithm to return an array of continuous points
 * between two provided points.
 */
function getContinuousPoints(point1: Point, point2: Point): Array<Point> {
  const points: Array<Point> = [];

  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  const signX = x1 < x2 ? 1 : -1;
  const signY = y1 < y2 ? 1 : -1;

  let error = dx - dy;
  let x = x1;
  let y = y1;

  points.push({ x, y });

  while (x !== x2 || y !== y2) {
    const error2 = error * 2;

    if (error2 > -dy) {
      error -= dy;
      x += signX;
    }

    if (error2 < dx) {
      error += dx;
      y += signY;
    }

    points.push({ x, y });
  }

  return points;
}
