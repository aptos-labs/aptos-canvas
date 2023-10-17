import { fabric } from "fabric";
import { MutableRefObject } from "react";

import { MAX_PIXELS_PER_TXN, MAX_PIXELS_PER_TXN_ADMIN, STROKE_COLORS } from "@/constants/canvas";
import { aggregatePixelsChanged, ImagePatch, useCanvasState } from "@/contexts/canvas";
import { createTempCanvas } from "@/utils/tempCanvas";

import { EventCanvas, Point } from "./types";
import { getPointScaler } from "./utils";

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

export interface ApplyImagePatchesArgs {
  canvas: fabric.Canvas;
  image: fabric.Image;
  size: number;
  basePixelArray: Uint8ClampedArray;
  imagePatches: Array<ImagePatch>;
  pixelArrayRef: MutableRefObject<Uint8ClampedArray>;
}

export function applyImagePatches({
  canvas,
  image,
  size,
  pixelArrayRef,
  basePixelArray,
  imagePatches,
}: ApplyImagePatchesArgs) {
  // Create new pixel array with the image patches applied
  const newPixelArray = new Uint8ClampedArray(basePixelArray);
  for (const imagePatch of imagePatches) {
    for (const pixelChanged of imagePatch.values()) {
      const color = STROKE_COLORS[pixelChanged.color];
      const index = (pixelChanged.y * size + pixelChanged.x) * 4;
      newPixelArray[index + 0] = color.red; // R value
      newPixelArray[index + 1] = color.green; // G value
      newPixelArray[index + 2] = color.blue; // B value
      newPixelArray[index + 3] = 255; // A value
    }
  }

  // Save new pixel array to the ref
  pixelArrayRef.current = newPixelArray;

  const [tempCanvas, cleanUp] = createTempCanvas(newPixelArray, size);

  // Update fabric image with data from temporary canvas and clean up when done
  image.setSrc(tempCanvas.toDataURL(), () => {
    canvas.requestRenderAll();
    cleanUp();
  });
}

export interface AlterImagePixelsArgs {
  image: fabric.Image;
  size: number;
  pixelArray: Uint8ClampedArray;
  canvas: EventCanvas;
  point1: Point;
  point2: Point;
  isNewLine: boolean;
}

export function alterImagePixels({
  image,
  size,
  pixelArray,
  canvas,
  point1,
  point2,
  isNewLine,
}: AlterImagePixelsArgs) {
  const scalePoint = getPointScaler(canvas, image);

  let points = getContinuousPoints(scalePoint(point1), scalePoint(point2));

  const { canDrawUnlimited, strokeColor, strokeWidth, currentChanges } = useCanvasState.getState();

  if (strokeWidth > 1) {
    // Multiply points by stroke width if it's greater than 1
    points = multiplyPoints(strokeWidth, points);
  }

  // Filter out out-of-bounds points
  points = points.filter(({ x, y }) => x >= 0 && x < size && y >= 0 && y < size);

  const newChanges = [...currentChanges];
  if (isNewLine || !newChanges[newChanges.length - 1]) {
    newChanges.push(new Map());
  }
  // The line above ensures newChanges always has a last element, but tsc disagrees :/
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const nextPixelsChanged = newChanges[newChanges.length - 1]!;

  const pixelLimit = canDrawUnlimited ? MAX_PIXELS_PER_TXN_ADMIN : MAX_PIXELS_PER_TXN;
  for (const point of points) {
    // Break out of loop to stop adding pixels once we hit the limit
    if (aggregatePixelsChanged(newChanges).size >= pixelLimit) break;

    nextPixelsChanged.set(`${point.x}-${point.y}`, {
      x: point.x,
      y: point.y,
      color: strokeColor,
    });
    const color = STROKE_COLORS[strokeColor];
    const index = (point.y * size + point.x) * 4;
    pixelArray[index + 0] = color.red; // R value
    pixelArray[index + 1] = color.green; // G value
    pixelArray[index + 2] = color.blue; // B value
    pixelArray[index + 3] = 255; // A value
  }

  if (!nextPixelsChanged.size) {
    // Bail out if we didn't change any pixels because we hit the pixel limit
    return;
  }

  const [tempCanvas, cleanUp] = createTempCanvas(pixelArray, size);

  // Update fabric image with data from temporary canvas and clean up when done
  image.setSrc(tempCanvas.toDataURL(), () => {
    canvas.requestRenderAll();
    cleanUp();
  });
  useCanvasState.setState({ currentChanges: newChanges });
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
