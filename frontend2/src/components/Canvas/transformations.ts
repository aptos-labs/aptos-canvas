import { fabric } from "fabric";

import { EventCanvas } from "./types";

export function wheelZoom(canvas: EventCanvas, x: number, y: number, delta: number) {
  const sensitivity = 3;
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** (delta * sensitivity);
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

export function smoothZoom(canvas: fabric.Canvas, newZoom: number) {
  const center = canvas.getCenter();
  const point = new fabric.Point(center.left, center.top);
  fabric.util.animate({
    startValue: canvas.getZoom(),
    endValue: newZoom,
    duration: 500,
    easing: fabric.util.ease.easeOutQuad,
    onChange: (nextZoomValue) => {
      canvas.zoomToPoint(point, nextZoomValue);
    },
  });
}

export function smoothResetPanAndZoom(canvas: fabric.Canvas, height: number, width: number) {
  const desiredZoom = 1;
  const minCanvas = Math.min(height, width);
  const zoomedHeight = minCanvas * desiredZoom;
  const zoomedWidth = minCanvas * desiredZoom;

  const currentX = canvas.viewportTransform?.[4] ?? 0;
  const currentY = canvas.viewportTransform?.[5] ?? 0;

  const endX = zoomedWidth / 2 - width + width / 2;
  const endY = zoomedHeight / 2 - height + height / 2;

  // Reset Zoom
  smoothZoom(canvas, desiredZoom);

  // Reset Pan X
  fabric.util.animate({
    startValue: currentX,
    endValue: -endX,
    duration: 500,
    easing: fabric.util.ease.easeOutQuad,
    onChange: (x) => {
      const vpt = canvas.viewportTransform;
      canvas.setViewportTransform([vpt?.[0] ?? 0, 0, 0, vpt?.[3] ?? 0, x, vpt?.[5] ?? 0]);
    },
  });

  // Reset Pan Y
  fabric.util.animate({
    startValue: currentY,
    endValue: -endY,
    duration: 500,
    easing: fabric.util.ease.easeOutQuad,
    onChange: (y) => {
      const vpt = canvas.viewportTransform;
      canvas.setViewportTransform([vpt?.[0] ?? 0, 0, 0, vpt?.[3] ?? 0, vpt?.[4] ?? 0, y]);
    },
  });
}
