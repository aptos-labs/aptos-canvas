import { fabric } from "fabric";

import { createTempCanvas } from "@/utils/tempCanvas";

export interface CreateGridOverlayArgs {
  size: number;
  canvas: fabric.Canvas;
  gridRef?: React.MutableRefObject<fabric.Image | undefined>;
}

export function createGridOverlay({ size, canvas, gridRef }: CreateGridOverlayArgs) {
  const pixelArray = new Uint8ClampedArray(size * size * 4);

  let isEvenRow = true;
  for (let i = 0; i < pixelArray.length; i += 4) {
    if (i % (size * 4) === 0) isEvenRow = !isEvenRow;
    const isEven = i % 8 === 0;
    pixelArray[i + 0] = 128; // R value
    pixelArray[i + 1] = 128; // G value
    pixelArray[i + 2] = 128; // B value
    pixelArray[i + 3] = isEvenRow ? (isEven ? 51 : 0) : isEven ? 0 : 51; // A value (20% or 0%)
  }

  const [tempCanvas, cleanUp] = createTempCanvas(pixelArray, size);

  fabric.Image.fromURL(
    tempCanvas.toDataURL(),
    function (overlay) {
      overlay.left = 0;
      overlay.top = 0;

      // Calculate minimum dimension of fabric canvas
      const canvasHeight = canvas.getHeight();
      const canvasWidth = canvas.getWidth();
      const minCanvas = Math.min(canvasHeight, canvasWidth);

      // Scale overlay to fit canvas
      overlay.scaleToHeight(minCanvas);
      overlay.scaleToWidth(minCanvas);

      // Add overlay to front of canvas
      canvas.add(overlay);
      overlay.bringToFront();

      // Save image to ref if provided
      if (gridRef) gridRef.current = overlay;

      cleanUp();
    },
    { selectable: false, imageSmoothing: false, objectCaching: false, visible: false },
  );
}
