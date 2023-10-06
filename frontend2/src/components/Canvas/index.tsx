"use client";
// @refresh reset

import { fabric } from "fabric";
import { useEffect, useRef } from "react";

import { PIXELS_PER_SIDE } from "@/constants/canvas";

import { alterImagePixels, createSquareImage, createSquareOfWhitePixels } from "./drawingImage";
import { mousePan, wheelPan, zoom } from "./gestures";
import { setGridVisibility } from "./gridLines";
import { EventCanvas, Point } from "./types";

// TODO: Convert grid lines to single image
// TODO: Make pan and zoom work on mobile

export interface CanvasProps {
  height: number;
  width: number;
  showGrid: boolean;
  initialImage?: Uint8ClampedArray;
}

export function Canvas({ height, width, showGrid, initialImage }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas>();
  const imageRef = useRef<fabric.Image>();
  const isDrawingRef = useRef<boolean>(false);
  const prevPointRef = useRef<Point>();
  const pixelArrayRef = useRef(initialImage ?? createSquareOfWhitePixels(PIXELS_PER_SIDE));

  useEffect(() => {
    // Initialize canvas
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      height,
      width,
      backgroundColor: "#ddd",
      selection: false,
      defaultCursor: "crosshair",
      hoverCursor: "crosshair",
      enablePointerEvents: true,
      // The types for this package are out of date so we have to do some type-casting
    } as fabric.ICanvasOptions);

    // Create image for user's to draw on
    createSquareImage({
      size: PIXELS_PER_SIDE,
      pixelArray: pixelArrayRef.current,
      canvas: newCanvas,
      imageRef,
    });

    // Zoom into the center of the image
    const initialZoom = 4;
    const minCanvas = Math.min(height, width);
    const zoomedHeight = minCanvas * initialZoom;
    const zoomedWidth = minCanvas * initialZoom;
    const x = zoomedWidth / 2 - width + width / 2;
    const y = zoomedHeight / 2 - height + height / 2;

    newCanvas.setZoom(initialZoom);
    newCanvas.setViewportTransform([4, 0, 0, 4, -x, -y]);

    // TODO: Rework grid overlay to only display at high zoom level
    // Create grid line overlay
    // createGridLines({
    //   size: PIXELS_PER_SIDE,
    //   canvas: newCanvas,
    //   visible: showGrid,
    // });

    newCanvas.on("mouse:wheel", function (this: EventCanvas, { e }) {
      e.preventDefault();
      e.stopPropagation();
      if (e.ctrlKey) {
        zoom(this, e.deltaY);
      } else {
        wheelPan(this, e.deltaX, e.deltaY);
      }
    });

    newCanvas.on("mouse:down", function (this: EventCanvas, { e }) {
      if (e.altKey) {
        isDrawingRef.current = false;
        this.hoverCursor = "grab";
        this.isDragging = true;
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      } else {
        isDrawingRef.current = true;
        this.hoverCursor = "crosshair";
        if (!imageRef.current) return;
        prevPointRef.current = { x: e.offsetX, y: e.offsetY };
        alterImagePixels({
          image: imageRef.current,
          size: PIXELS_PER_SIDE,
          pixelArray: pixelArrayRef.current,
          canvas: this,
          point1: prevPointRef.current,
          point2: { x: e.offsetX, y: e.offsetY },
        });
      }
    });

    newCanvas.on("mouse:move", function (this: EventCanvas, { e }) {
      if (this.isDragging) {
        this.hoverCursor = "grabbing";
        mousePan(this, e.clientX, e.clientY);
      } else if (isDrawingRef.current) {
        if (!imageRef.current) return;
        if (e.target !== this.upperCanvasEl) return; // Stop handling event when outside canvas
        alterImagePixels({
          image: imageRef.current,
          size: PIXELS_PER_SIDE,
          pixelArray: pixelArrayRef.current,
          canvas: this,
          point1: prevPointRef.current ?? { x: e.offsetX, y: e.offsetY },
          point2: { x: e.offsetX, y: e.offsetY },
        });
        prevPointRef.current = { x: e.offsetX, y: e.offsetY };
      }
    });

    newCanvas.on("mouse:up", function (this: EventCanvas) {
      // On mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      if (this.viewportTransform) this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.hoverCursor = "crosshair";
      isDrawingRef.current = false;
      prevPointRef.current = undefined;
    });

    fabricRef.current = newCanvas;

    return () => {
      newCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setDimensions({ height, width });
    canvas.calcOffset();
    canvas.renderAll();
  }, [height, width]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setGridVisibility(canvas, showGrid);
  }, [showGrid]);

  return <canvas ref={canvasRef} />;
}
