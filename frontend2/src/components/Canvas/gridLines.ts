import { fabric } from "fabric";

export interface CreateGridLinesArgs {
  size: number;
  canvas: fabric.Canvas;
  visible: boolean;
}

export function createGridLines({ size, canvas, visible }: CreateGridLinesArgs) {
  const canvasSize = canvas.height ?? 0;
  const pixelSize = canvasSize / size;
  const lineData = { type: "line", stroke: "#ddd", selectable: false, visible };

  for (let i = 1; i < size; i++) {
    canvas.add(new fabric.Line([i * pixelSize, 0, i * pixelSize, canvasSize], lineData));
    canvas.add(new fabric.Line([0, i * pixelSize, canvasSize, i * pixelSize], lineData));
  }
}

export function setGridVisibility(canvas: fabric.Canvas | undefined, showGrid: boolean) {
  if (!canvas) return;
  canvas.forEachObject((o) => {
    if (o.type === "line") o.visible = showGrid;
  });
  canvas.renderAll();
}
