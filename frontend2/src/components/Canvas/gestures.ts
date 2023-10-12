import { fabric } from "fabric";

import { EventCanvas } from "./types";

export function wheelZoom(canvas: EventCanvas, x: number, y: number, delta: number) {
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 100) zoom = 100;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint(new fabric.Point(x, y), zoom);
}

export function pinchZoom(canvas: EventCanvas, x: number, y: number, newZoom: number) {
  let zoom = newZoom;
  if (zoom > 100) zoom = 100;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint(new fabric.Point(x, y), zoom);
}

export function smoothZoom(canvas: fabric.Canvas, newZoom: number) {
  const center = canvas.getCenter();
  fabric.util.animate({
    startValue: canvas.getZoom(),
    endValue: newZoom,
    duration: 500,
    easing: fabric.util.ease.easeOutQuad,
    onChange: (nextZoomValue) => {
      canvas.zoomToPoint(new fabric.Point(center.left, center.top), nextZoomValue);
    },
  });
}

export function wheelPan(canvas: EventCanvas, deltaX: number, deltaY: number) {
  const vpt = canvas.viewportTransform;
  if (vpt?.[4] !== undefined) vpt[4] -= deltaX;
  if (vpt?.[5] !== undefined) vpt[5] -= deltaY;
  canvas.requestRenderAll();
  if (canvas.viewportTransform) canvas.setViewportTransform(canvas.viewportTransform);
}

export function mousePan(canvas: EventCanvas, clientX: number, clientY: number) {
  const vpt = canvas.viewportTransform;
  if (vpt?.[4] !== undefined) vpt[4] += clientX - canvas.lastPosX;
  if (vpt?.[5] !== undefined) vpt[5] += clientY - canvas.lastPosY;
  canvas.requestRenderAll();
  canvas.lastPosX = clientX;
  canvas.lastPosY = clientY;
}
