import { EventCanvas } from "./types";

export function zoom(canvas: EventCanvas, delta: number) {
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.setZoom(zoom);
}

export function wheelPan(canvas: EventCanvas, deltaX: number, deltaY: number) {
  const vpt = canvas.viewportTransform;
  if (vpt?.[4] !== undefined) vpt[4] -= deltaX;
  if (vpt?.[5] !== undefined) vpt[5] -= deltaY;
  canvas.requestRenderAll();
  if (canvas.viewportTransform) canvas.setViewportTransform(canvas.viewportTransform);
  // console.log(canvas.viewportTransform);
}

export function mousePan(canvas: EventCanvas, clientX: number, clientY: number) {
  const vpt = canvas.viewportTransform;
  if (vpt?.[4] !== undefined) vpt[4] += clientX - canvas.lastPosX;
  if (vpt?.[5] !== undefined) vpt[5] += clientY - canvas.lastPosY;
  canvas.requestRenderAll();
  canvas.lastPosX = clientX;
  canvas.lastPosY = clientY;
}