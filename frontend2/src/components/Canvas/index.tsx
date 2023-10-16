"use client";
// @refresh reset

import { fabric } from "fabric";
import { useCallback, useEffect, useRef } from "react";

import { DRAW_MODE_ZOOM, PIXELS_PER_SIDE, VIEW_MODE_ZOOM } from "@/constants/canvas";
import {
  useCanvasCommandListener,
  useCanvasState,
  useOptimisticUpdateGarbageCollector,
} from "@/contexts/canvas";
import { assertUnreachable } from "@/utils/assertUnreachable";
import { useThemeChange } from "@/utils/useThemeChange";

import { alterImagePixels, applyImagePatches, createSquareImage } from "./drawImage";
import { DrawingCursor } from "./DrawingCursor";
import { mousePan, pinchZoom, smoothZoom, wheelPan, wheelZoom } from "./gestures";
import { useKeyboardShortcuts } from "./keyboardShortcuts";
import { EventCanvas, Point } from "./types";

export interface CanvasProps {
  height: number;
  width: number;
  baseImage: Uint8ClampedArray;
  isCursorInBounds: boolean;
}

export function Canvas({ height, width, baseImage, isCursorInBounds }: CanvasProps) {
  const isInitialized = useCanvasState((s) => s.isInitialized);
  const isViewOnly = useCanvasState((s) => s.isViewOnly);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas>();
  const imageRef = useRef<fabric.Image>();
  const isDrawingRef = useRef<boolean>(false);
  const prevPointRef = useRef<Point>();
  const isGesturingRef = useRef<boolean>(false);
  const pixelArrayRef = useRef(new Uint8ClampedArray(baseImage));

  const supportsTouch = "ontouchstart" in document.documentElement;

  useKeyboardShortcuts();

  useEffect(function initializeCanvas() {
    // Initialize canvas
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      height,
      width,
      backgroundColor: getCanvasBackgroundColor(),
      selection: false,
      defaultCursor: "none",
      hoverCursor: "none",
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

  const handleThemeChange = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.setBackgroundColor(getCanvasBackgroundColor(), () => canvas.requestRenderAll());
  }, []);
  useThemeChange(handleThemeChange);

  useEffect(
    function updateCanvasSize() {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.setDimensions({ height, width });
      canvas.calcOffset();
      canvas.requestRenderAll();
    },
    [height, width],
  );

  useEffect(
    function updateBaseImage() {
      const canvas = fabricRef.current;
      const image = imageRef.current;
      if (!canvas || !image) return;

      const { optimisticUpdates, currentChanges } = useCanvasState.getState();
      const imagePatches = optimisticUpdates.map((ou) => ou.imagePatch).concat(...currentChanges);

      applyImagePatches({
        canvas,
        image,
        size: PIXELS_PER_SIDE,
        pixelArrayRef,
        basePixelArray: baseImage,
        imagePatches,
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
        canvas.defaultCursor = "none";
        canvas.hoverCursor = "none";
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
          this.hoverCursor = "none";
          if (!imageRef.current) return;
          prevPointRef.current = { x: e.offsetX, y: e.offsetY };
          alterImagePixels({
            image: imageRef.current,
            size: PIXELS_PER_SIDE,
            pixelArray: pixelArrayRef.current,
            canvas: this,
            point1: prevPointRef.current,
            point2: { x: e.offsetX, y: e.offsetY },
            isNewLine: true,
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
            isNewLine: false,
          });
          prevPointRef.current = { x: e.offsetX, y: e.offsetY };
        }
      }

      function handleMouseUp(this: EventCanvas) {
        this.isDragging = false;
        this.hoverCursor = isViewOnly ? "grab" : "none";
        isDrawingRef.current = false;
        prevPointRef.current = undefined;
      }

      let zoomStartScale = fabricRef.current?.getZoom() ?? 1;
      let gestureTimeout: number | null = null;
      function handleTouchGesture(this: EventCanvas, event: fabric.ITouchEvent) {
        const { fingers, state, x, y, scale } = event.self;
        if (fingers === 2) {
          if (state === "start") {
            isGesturingRef.current = true;
            zoomStartScale = this.getZoom();
            this.lastPosX = x;
            this.lastPosY = y;
          } else if (state === "change") {
            pinchZoom(this, x, y, zoomStartScale * scale);
            mousePan(this, x, y);
            // There's no "end" event for touch:gesture so we'll leave the canvas in its
            // gesture state for a bit of time after the last gesture event to prevent
            // accidental touch:drag events.
            if (gestureTimeout) window.clearTimeout(gestureTimeout);
            gestureTimeout = window.setTimeout(() => (isGesturingRef.current = false), 250);
          }
        }
      }

      function handleTouchDrag(this: EventCanvas, event: fabric.ITouchEvent) {
        const { fingers, state, x, y } = event.self;
        if (fingers !== 1 || isGesturingRef.current) return;
        if (isViewOnly) {
          // Pan canvas
          if (state === "down") {
            this.lastPosX = x;
            this.lastPosY = y;
          } else if (state === "move") {
            mousePan(this, x, y);
          }
        } else {
          // Draw on canvas
          if (state === "down") {
            isDrawingRef.current = true;
            if (!imageRef.current) return;
            prevPointRef.current = { x, y };
            alterImagePixels({
              image: imageRef.current,
              size: PIXELS_PER_SIDE,
              pixelArray: pixelArrayRef.current,
              canvas: this,
              point1: prevPointRef.current,
              point2: { x, y },
              isNewLine: true,
            });
          } else if (state === "move") {
            if (!imageRef.current) return;
            alterImagePixels({
              image: imageRef.current,
              size: PIXELS_PER_SIDE,
              pixelArray: pixelArrayRef.current,
              canvas: this,
              point1: prevPointRef.current ?? { x, y },
              point2: { x, y },
              isNewLine: false,
            });
            prevPointRef.current = { x, y };
          } else if (state === "up") {
            isDrawingRef.current = false;
            prevPointRef.current = undefined;
          }
        }
      }

      if (supportsTouch) {
        canvas.on("touch:gesture", handleTouchGesture);
        canvas.on("touch:drag", handleTouchDrag);
      } else {
        canvas.on("mouse:wheel", handleMouseWheel);
        canvas.on("mouse:down", handleMouseDown);
        canvas.on("mouse:move", handleMouseMove);
        canvas.on("mouse:up", handleMouseUp);
      }

      return () => {
        if (supportsTouch) {
          canvas.off("touch:gesture", handleTouchGesture);
          canvas.off("touch:drag", handleTouchDrag);
        } else {
          canvas.off("mouse:wheel", handleMouseWheel);
          canvas.off("mouse:down", handleMouseDown);
          canvas.off("mouse:move", handleMouseMove);
          canvas.off("mouse:up", handleMouseUp);
        }
      };
    },
    [isViewOnly, supportsTouch],
  );

  useCanvasCommandListener((command) => {
    const canvas = fabricRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    switch (command) {
      case "clearChangedPixels": {
        const { optimisticUpdates } = useCanvasState.getState();
        const imagePatches = optimisticUpdates.map((ou) => ou.imagePatch);

        applyImagePatches({
          canvas,
          image,
          size: PIXELS_PER_SIDE,
          pixelArrayRef,
          basePixelArray: baseImage,
          imagePatches,
        });

        useCanvasState.setState({ currentChanges: [] });
        return;
      }
      case "undoLastChange": {
        const { optimisticUpdates, currentChanges } = useCanvasState.getState();
        const newChanges = [...currentChanges];
        newChanges.pop(); // Remove last change
        const imagePatches = optimisticUpdates.map((ou) => ou.imagePatch).concat(...newChanges);

        applyImagePatches({
          canvas,
          image,
          size: PIXELS_PER_SIDE,
          pixelArrayRef,
          basePixelArray: baseImage,
          imagePatches,
        });

        useCanvasState.setState({ currentChanges: newChanges });
        return;
      }
      default: {
        return assertUnreachable(command, "Unknown canvas command received");
      }
    }
  });

  return (
    <>
      <canvas ref={canvasRef} />
      {!supportsTouch && isInitialized && !isViewOnly && isCursorInBounds && fabricRef.current && (
        <DrawingCursor canvas={fabricRef.current} />
      )}
    </>
  );
}

function getCanvasBackgroundColor() {
  // This maps to colors.canvas.bg from /panda-preset/colors.ts
  return window.getComputedStyle(document.documentElement).getPropertyValue("--colors-canvas-bg");
}
