"use client";
// @refresh reset

import { fabric } from "fabric";
import { useEffect, useRef } from "react";

import { DRAW_MODE_ZOOM, PIXELS_PER_SIDE, VIEW_MODE_ZOOM } from "@/constants/canvas";
import {
  useCanvasCommandListener,
  useCanvasState,
  useOptimisticUpdateGarbageCollector,
} from "@/contexts/canvas";
import { createTempCanvas } from "@/utils/tempCanvas";

import { alterImagePixels, createSquareImage } from "./drawImage";
import { mousePan, pinchZoom, smoothZoom, wheelPan, wheelZoom } from "./gestures";
import { EventCanvas, Point } from "./types";

export interface CanvasProps {
  height: number;
  width: number;
  baseImage: Uint8ClampedArray;
}

export function Canvas({ height, width, baseImage }: CanvasProps) {
  const isViewOnly = useCanvasState((s) => s.isViewOnly);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas>();
  const imageRef = useRef<fabric.Image>();
  const isDrawingRef = useRef<boolean>(false);
  const prevPointRef = useRef<Point>();
  const pixelArrayRef = useRef(new Uint8ClampedArray(baseImage));

  useEffect(function initializeCanvas() {
    // Initialize canvas
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      height,
      width,
      backgroundColor: "#ddd",
      selection: false,
      defaultCursor: "crosshair",
      hoverCursor: "crosshair",
      enablePointerEvents: true,
    });

    // Create image for user's to draw on
    createSquareImage({
      size: PIXELS_PER_SIDE,
      pixelArray: pixelArrayRef.current,
      canvas: newCanvas,
      imageRef,
    });

    // Zoom into the center of the image
    const initialZoom = VIEW_MODE_ZOOM;
    const minCanvas = Math.min(height, width);
    const zoomedHeight = minCanvas * initialZoom;
    const zoomedWidth = minCanvas * initialZoom;
    const x = zoomedWidth / 2 - width + width / 2;
    const y = zoomedHeight / 2 - height + height / 2;

    newCanvas.setZoom(initialZoom);
    newCanvas.setViewportTransform([initialZoom, 0, 0, initialZoom, -x, -y]);

    fabricRef.current = newCanvas;

    useCanvasState.setState({ isInitialized: true });

    return () => {
      newCanvas.dispose();
    };
    // This initialization effect should only be run once so we shouldn't provide any effect deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    function updateCanvasSize() {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.setDimensions({ height, width });
      canvas.calcOffset();
      canvas.renderAll();
    },
    [height, width],
  );

  useEffect(
    function updateBaseImage() {
      const canvas = fabricRef.current;
      const image = imageRef.current;
      if (!canvas || !image) return;

      const newPixelArray = new Uint8ClampedArray(baseImage);
      const { optimisticUpdates, pixelsChanged } = useCanvasState.getState();
      const allImagePatches = optimisticUpdates.map((ou) => ou.imagePatch).concat(pixelsChanged);

      for (const imagePatch of allImagePatches) {
        for (const pixelChanged of imagePatch.values()) {
          const index = (pixelChanged.y * PIXELS_PER_SIDE + pixelChanged.x) * 4;
          newPixelArray[index + 0] = pixelChanged.r; // R value
          newPixelArray[index + 1] = pixelChanged.g; // G value
          newPixelArray[index + 2] = pixelChanged.b; // B value
          newPixelArray[index + 3] = 255; // A value
        }
      }
      pixelArrayRef.current = newPixelArray;

      const [tempCanvas, cleanUp] = createTempCanvas(newPixelArray, PIXELS_PER_SIDE);

      // Update fabric image with data from temporary canvas and clean up when done
      image.setSrc(tempCanvas.toDataURL(), () => {
        canvas.renderAll();
        cleanUp();
      });
    },
    [baseImage],
  );

  useOptimisticUpdateGarbageCollector();

  useEffect(
    function manageViewAndDrawModes() {
      const canvas = fabricRef.current;
      if (!canvas) return;

      if (isViewOnly) {
        smoothZoom(canvas, VIEW_MODE_ZOOM);
        canvas.defaultCursor = "grab";
        canvas.hoverCursor = "grab";
      } else {
        smoothZoom(canvas, DRAW_MODE_ZOOM);
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
      }

      function handleMouseWheel(this: EventCanvas, { e }: fabric.IEvent<WheelEvent>) {
        e.preventDefault();
        e.stopPropagation();
        if (e.ctrlKey) {
          wheelZoom(this, e.offsetX, e.offsetY, e.deltaY);
        } else {
          wheelPan(this, e.deltaX, e.deltaY);
        }
      }

      function handleMouseDown(this: EventCanvas, { e }: fabric.IEvent<MouseEvent>) {
        if (e.altKey || isViewOnly) {
          isDrawingRef.current = false;
          this.hoverCursor = "grabbing";
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
      }

      function handleMouseMove(this: EventCanvas, { e }: fabric.IEvent<MouseEvent>) {
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
      }

      function handleMouseUp(this: EventCanvas) {
        // On mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        if (this.viewportTransform) this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.hoverCursor = isViewOnly ? "grab" : "crosshair";
        isDrawingRef.current = false;
        prevPointRef.current = undefined;
      }

      let zoomStartScale = fabricRef.current?.getZoom() ?? 1;
      function handleTouchGesture(this: EventCanvas, event: fabric.IGestureEvent) {
        // Disable touch gestures while drawing
        if (isDrawingRef.current) return;
        const { fingers, state, x, y, scale } = event.self;
        if (fingers === 2) {
          if (state == "start") {
            zoomStartScale = this.getZoom();
          } else {
            pinchZoom(this, x, y, zoomStartScale * scale);
          }
        }
      }

      canvas.on("mouse:wheel", handleMouseWheel);
      canvas.on("touch:gesture", handleTouchGesture);
      canvas.on("mouse:down", handleMouseDown);
      canvas.on("mouse:move", handleMouseMove);
      canvas.on("mouse:up", handleMouseUp);

      return () => {
        canvas.off("mouse:wheel", handleMouseWheel);
        canvas.on("touch:gesture", handleTouchGesture);
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
      };
    },
    [isViewOnly],
  );

  useCanvasCommandListener(() => {
    // Handle clear changed pixels command
    const canvas = fabricRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Apply optimistic updates to base image
    const newPixelArray = new Uint8ClampedArray(baseImage);
    const { optimisticUpdates } = useCanvasState.getState();
    const imagePatches = optimisticUpdates.map((ou) => ou.imagePatch);
    for (const imagePatch of imagePatches) {
      for (const pixelChanged of imagePatch.values()) {
        const index = (pixelChanged.y * PIXELS_PER_SIDE + pixelChanged.x) * 4;
        newPixelArray[index + 0] = pixelChanged.r; // R value
        newPixelArray[index + 1] = pixelChanged.g; // G value
        newPixelArray[index + 2] = pixelChanged.b; // B value
        newPixelArray[index + 3] = 255; // A value
      }
    }

    const [tempCanvas, cleanUp] = createTempCanvas(newPixelArray, PIXELS_PER_SIDE);

    // Update fabric image with data from temporary canvas and clean up when done
    image.setSrc(tempCanvas.toDataURL(), () => {
      canvas.renderAll();
      cleanUp();
    });

    useCanvasState.setState({ pixelsChanged: new Map() });
    pixelArrayRef.current = new Uint8ClampedArray(newPixelArray);
  });

  return <canvas ref={canvasRef} />;
}
