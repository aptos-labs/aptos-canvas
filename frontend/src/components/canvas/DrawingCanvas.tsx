import { Box } from "@chakra-ui/react";
import React, { useState } from "react";
import { Color, useDrawMode } from "../../context/DrawModeContext";

export type DrawPixelIntent = {
  x: number;
  y: number;
  color: Color;
};

// Simple linear interpolation between two points
function getInterpolatePoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: Color,
) {
  const points = [];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const stepCount = Math.max(Math.abs(dx), Math.abs(dy));
  const stepX = dx / stepCount;
  const stepY = dy / stepCount;

  for (let i = 0; i < stepCount; i++) {
    points.push({
      x: Math.round(x1 + i * stepX),
      y: Math.round(y1 + i * stepY),
      color,
    });
  }

  return points;
}

function getSizedSquares(
  points: DrawPixelIntent[],
  size: number,
  canvasWidth: number,
  canvasHeight: number,
  color: Color,
) {
  const numPointsUpLeft = Math.floor(size / 2);
  const numPointsDownRight = Math.ceil(size / 2);

  const squares: DrawPixelIntent[] = [];
  points.forEach((point) => {
    for (let i = -numPointsUpLeft; i < numPointsDownRight; i++) {
      for (let j = -numPointsUpLeft; j < numPointsDownRight; j++) {
        const x = point.x + i;
        const y = point.y + j;
        if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
          squares.push({ x, y, color });
        }
      }
    }
  });

  return squares;
}

export default function DrawingCanvas({
  drawingRef,
  squaresToDraw,
  setSquaresToDraw,
  displayCanvasWidth,
  displayCanvasHeight,
  offsets,
  scale,
  pan,
}: {
  drawingRef: any;
  squaresToDraw: DrawPixelIntent[];
  setSquaresToDraw: (squares: DrawPixelIntent[]) => void;
  displayCanvasWidth: number;
  displayCanvasHeight: number;
  offsets: { x: number; y: number };
  scale: number | undefined;
  pan: { x: number; y: number };
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPoint, setPrevPoints] = useState<{ x: number; y: number } | null>(
    null,
  );

  const { brushSize, brushColor } = useDrawMode();

  const handleMouseMoveDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    const drawingContext = drawing?.getContext("2d");
    if (!drawing || !drawingContext || scale === undefined) return;

    if (!isDrawing) return;

    const rect = drawing.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - pan.x) / scale - offsets.x);
    const y = Math.floor((e.clientY - rect.top - pan.y) / scale - offsets.y);

    const newPoints = [{ x, y, color: brushColor }];
    if (prevPoint) {
      // fill in the points in between of the current mouse location and the previous mouse location
      const squaresInBetween = getInterpolatePoints(
        prevPoint.x,
        prevPoint.y,
        x,
        y,
        brushColor,
      );
      newPoints.push(...squaresInBetween);
    }

    const sizedNewSquares = getSizedSquares(
      newPoints,
      brushSize,
      displayCanvasWidth,
      displayCanvasHeight,
      brushColor,
    );

    setSquaresToDraw([...squaresToDraw, ...sizedNewSquares]);
    setPrevPoints({ x, y });
  };

  const handleMouseDownDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
  };

  const handleMouseUpDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    setPrevPoints(null);
  };

  return (
    <Box>
      <canvas
        ref={drawingRef}
        style={{ position: "absolute", cursor: "crosshair" }}
        width={displayCanvasWidth}
        height={displayCanvasHeight}
        onMouseMove={handleMouseMoveDrawing}
        onMouseDown={handleMouseDownDrawing}
        onMouseUp={handleMouseUpDrawing}
      />
    </Box>
  );
}
