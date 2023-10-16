import { fabric } from "fabric";
import { Point } from "framer-motion";

export function getCanvasBackgroundColor() {
  // This maps to colors.canvas.bg from /panda-preset/colors.ts
  return window.getComputedStyle(document.documentElement).getPropertyValue("--colors-canvas-bg");
}

export function getPointScaler(canvas: fabric.Canvas, image: fabric.Image) {
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

  return function scalePoint(point: Point): Point {
    return {
      x: scalePosition(point.x - (panX ?? 0)),
      y: scalePosition(point.y - (panY ?? 0)),
    };
  };
}
