export interface EventCanvas extends fabric.Canvas {
  isDragging: boolean;
  lastPosX: number;
  lastPosY: number;
  cacheCanvasEl: HTMLCanvasElement;
  upperCanvasEl: HTMLCanvasElement;
  lowerCanvasEl: HTMLCanvasElement;
}

export interface Point {
  x: number;
  y: number;
}
