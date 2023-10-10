import { fabric } from "fabric";

import { useCanvasState } from "@/contexts/canvas";
import { createTempCanvas } from "@/utils/tempCanvas";

import { EventCanvas, Point } from "./types";

export interface CreateImageArgs {
  size: number;
  pixelArray: Uint8ClampedArray;
  canvas: fabric.Canvas;
  imageRef?: React.MutableRefObject<fabric.Image | undefined>;
}

export function createSquareImage({ size, pixelArray, canvas, imageRef }: CreateImageArgs) {
  const [tempCanvas, cleanUp] = createTempCanvas(pixelArray, size);

  // Write data from temporary canvas to new fabric image and clean up when done
  fabric.Image.fromURL(
    tempCanvas.toDataURL(),
    function (img) {
      img.left = 0;
      img.top = 0;

      // Calculate minimum dimension of fabric canvas
      const canvasHeight = canvas.getHeight();
      const canvasWidth = canvas.getWidth();
      const minCanvas = Math.min(canvasHeight, canvasWidth);

      // Scale image to fit canvas
      img.scaleToHeight(minCanvas);
      img.scaleToWidth(minCanvas);

      // Add image to canvas
      canvas.add(img);
      img.sendToBack();

      // Save image to ref if provided
      if (imageRef) imageRef.current = img;

      cleanUp();
    },
    { selectable: false, imageSmoothing: false, objectCaching: false },
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

  let points = getContinuousPoints(scalePoint(point1), scalePoint(point2));

  const { strokeColor, strokeWidth, pixelsChanged } = useCanvasState.getState();

  if (strokeWidth > 1) {
    // Multiply points by stroke width if it's greater than 1
    points = multiplyPoints(strokeWidth, points);
  }

  // Filter out out-of-bounds points
  points = points.filter(({ x, y }) => x >= 0 && x < size && y >= 0 && y < size);

  const nextPixelsChanged = { ...pixelsChanged };
  for (const point of points) {
    nextPixelsChanged[`${point.x}-${point.y}`] = {
      x: point.x,
      y: point.y,
      r: strokeColor.red,
      g: strokeColor.green,
      b: strokeColor.blue,
    };
    const index = (point.y * size + point.x) * 4;
    pixelArray[index + 0] = strokeColor.red; // R value
    pixelArray[index + 1] = strokeColor.green; // G value
    pixelArray[index + 2] = strokeColor.blue; // B value
    pixelArray[index + 3] = 255; // A value
  }

  const [tempCanvas, cleanUp] = createTempCanvas(pixelArray, size);

  // Update fabric image with data from temporary canvas and clean up when done
  image.setSrc(tempCanvas.toDataURL(), () => {
    canvas.renderAll();
    cleanUp();
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

function multiplyPoints(strokeWidth: number, points: Array<Point>): Array<Point> {
  const multipliedPoints = [];

  const halfSideLength = Math.floor(strokeWidth / 2);

  for (const point of points) {
    for (let i = -halfSideLength; i < halfSideLength; i++) {
      for (let j = -halfSideLength; j < halfSideLength; j++) {
        multipliedPoints.push({ x: point.x + i, y: point.y + j });
      }
    }
  }

  return multipliedPoints;
}
