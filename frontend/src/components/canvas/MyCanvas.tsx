import React, { useCallback, useEffect, useRef, useState } from "react";
import { Token, Canvas } from "../../canvas/generated/types";
import { Box } from "@chakra-ui/react";
import { useGetPixels } from "../../api/hooks/useGetPixels";
import { CanvasPopover } from "./CanvasPopover";
import ZoomButtons from "./ZoomButtons";
import DrawingCanvas from "./DrawingCanvas";
import { StyledCanvasBox } from "./StyledCanvasBox";
import { useDrawMode } from "../../context/DrawModeContext";
import SubmitDrawButton from "./SubmitDrawButton";

const PIXEL_SIZE = 0.98; // the width of each pixel in the canvas
const MARGIN_COLOR = "white";
const INITIAL_SCALE_OFFSET = 1; // How much to scale the canvas by initially, for example 1.5 means 150% of the canvas size.

export const MyCanvas = ({
  canvasData,
  tokenData,
}: {
  canvasData: Canvas;
  tokenData: Token;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<HTMLCanvasElement | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const pixels = useGetPixels(tokenData);

  const { drawModeOn, brushColor } = useDrawMode();
  const [squaresToDraw, setSquaresToDraw] = useState<
    { x: number; y: number }[]
  >([]);

  // Store scale and pan in state
  const [scale, setScale] = useState<number | undefined>(undefined);
  const [initialScale, setInitialScale] = useState<number | undefined>(
    undefined,
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Where we show the color picker popover.
  const [popoverPos, setPopoverPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  const [openPopover, setOpenPopover] = useState(false);
  useEffect(() => {
    // useEffect to set openPopover back to false after it has been passed to the child
    // This is a way to notify the CanvasPopover component to open the popover.
    let timeoutId: any;
    if (openPopover) {
      timeoutId = setTimeout(() => {
        setOpenPopover(false);
      }, 500); // Wait for 0.5 seconds
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [openPopover]);

  const canvasWidth = parseInt(canvasData.config.width);
  const canvasHeight = parseInt(canvasData.config.height);

  const getOffsets = useCallback(() => {
    const parent = parentRef.current;
    if (!parent || scale === undefined) return;
    const x = (parent.clientWidth / scale - canvasWidth) / 2;
    const y = (parent.clientHeight / scale - canvasHeight) / 2;
    // console.log("Offsets", x, y);
    return { x, y };
  }, [canvasHeight, canvasWidth, scale]);

  useEffect(() => {
    const parent = parentRef.current;

    if (!parent) return;

    // Determine the scaling factor based on the parent.
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    const scaleX = parentWidth / canvasWidth;
    const scaleY = parentHeight / canvasHeight;

    // Use the smaller scale factor to ensure the canvas fits within the parent without stretching
    let s = Math.min(scaleX, scaleY) * INITIAL_SCALE_OFFSET;
    setInitialScale(s);
    setScale(s);
  }, [canvasHeight, canvasWidth, parentRef]);

  // This one uses the native DOM API WheelEvent, not the React synthetic event.
  // https://stackoverflow.com/a/67258046/3846032
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (scale === undefined) return;

      e.stopPropagation();
      e.preventDefault();

      let newScale = scale;
      newScale *= e.deltaY > 0 ? 0.9 : 1.1;
      setScale(newScale);
    },
    [scale],
  );

  useEffect(() => {
    if (!drawModeOn) {
      setSquaresToDraw([]);
    }
  }, [drawModeOn]);

  useEffect(() => {
    const parent = parentRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const drawing = drawingRef.current;
    const context = canvas?.getContext("2d");
    const overlayContext = overlay?.getContext("2d");
    const drawingContext = drawing?.getContext("2d");

    if (!canvas || !context || !parent || scale === undefined) return;

    // https://stackoverflow.com/a/67258046/3846032
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Increase the physical size of the canvas to fill the parent.
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    if (overlay && overlayContext) {
      overlay.width = parent.clientWidth;
      overlay.height = parent.clientHeight;
    }

    if (drawing && drawingContext) {
      drawing.width = parent.clientWidth;
      drawing.height = parent.clientHeight;
    }

    // Calculate offsets for centering the art.
    const offsets = getOffsets()!;

    // Decrease the scale at which things are drawn
    context.save();
    context.translate(pan.x, pan.y);
    context.scale(scale, scale);

    if (overlay && overlayContext) {
      overlayContext.save();
      overlayContext.translate(pan.x, pan.y);
      overlayContext.scale(scale, scale);
    }

    if (drawing && drawingContext) {
      drawingContext.save();
      drawingContext.translate(pan.x, pan.y);
      drawingContext.scale(scale, scale);
    }

    // Decide how much of a margin should appear between square.
    const margin = 1 - PIXEL_SIZE;

    pixels.forEach((color, index) => {
      const x = (index % canvasWidth) + offsets.x;
      const y = Math.floor(index / canvasWidth) + offsets.y;

      // Draw underneath the squares so a margin appears.
      context.fillStyle = MARGIN_COLOR;
      context.fillRect(x, y, PIXEL_SIZE + margin, PIXEL_SIZE + margin);

      // Draw the squares.
      context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
      context.fillRect(
        x + margin, // Shift the pixel to the right by the margin
        y + margin, // Shift the pixel down by the margin
        PIXEL_SIZE, // Reduce the pixel's width by the margin
        PIXEL_SIZE, // Reduce the pixel's height by the margin
      );
    });

    // Draw the squares to draw on top.
    squaresToDraw.forEach((square) => {
      const x = square.x + offsets.x;
      const y = square.y + offsets.y;

      // Draw underneath the squares so a margin appears.
      context.fillStyle = MARGIN_COLOR;
      context.fillRect(x, y, PIXEL_SIZE + margin, PIXEL_SIZE + margin);

      // Draw the squares.
      context.fillStyle = brushColor;
      context.fillRect(
        x + margin, // Shift the pixel to the right by the margin
        y + margin, // Shift the pixel down by the margin
        PIXEL_SIZE, // Reduce the pixel's width by the margin
        PIXEL_SIZE, // Reduce the pixel's height by the margin
      );
    });

    context.restore();

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [
    canvasData,
    canvasWidth,
    parentRef,
    scale,
    pan,
    pixels,
    getOffsets,
    handleWheel,
    drawModeOn,
    squaresToDraw,
  ]);

  const handleMouseMoveOverlay = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const parent = parentRef.current;
    const overlay = overlayRef.current;
    const overlayContext = overlay?.getContext("2d");
    if (!overlay || !overlayContext || !parent || scale === undefined) return;

    const offsets = getOffsets()!;

    const rectSize = 1.5;

    if (dragging) {
      const newPan = {
        x: pan.x + (e.clientX - lastMousePos.x),
        y: pan.y + (e.clientY - lastMousePos.y),
      };
      setPan(newPan);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else {
      // Adjust for scale and pan
      const rect = overlay.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left - pan.x) / scale - offsets.x);
      const y = Math.floor((e.clientY - rect.top - pan.y) / scale - offsets.y);

      // Clear the previous overlay cursor element.
      // Clear rectangle taking into account the transformations (scale and pan).
      overlayContext.clearRect(
        (-pan.x + offsets.x) / scale,
        (-pan.y + offsets.y) / scale,
        // We clear 1000x wide just for good measure, since I saw with this change that
        // it'd still appear on the far right sometimes.
        (parent.clientWidth / scale) * 1000,
        (parent.clientHeight / scale) * 1000,
      );

      // Return if the cursor is outside the canvas.
      if (!(x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight)) {
        return;
      }

      // Draw a multi colored rectangle around the hovered square.
      const strokes = [
        { lineWidth: 0.4, color: "green" },
        { lineWidth: 0.3, color: "blue" },
        { lineWidth: 0.2, color: "red" },
        { lineWidth: 0.1, color: "yellow" },
      ];

      overlayContext.save();

      strokes.forEach((stroke) => {
        overlayContext.lineWidth = stroke.lineWidth;
        overlayContext.strokeStyle = stroke.color;
        overlayContext.strokeRect(
          x + offsets.x + 0.5 - rectSize / 2 - stroke.lineWidth / 2,
          y + offsets.y + 0.5 - rectSize / 2 - stroke.lineWidth / 2,
          rectSize + stroke.lineWidth,
          rectSize + stroke.lineWidth,
        );
      });

      overlayContext.restore();
    }
  };

  const handleMouseDownOverlay = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    setLastPan(pan);
  };

  const handleMouseUpOverlay = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDragging(false);
    if (pan.x === lastPan.x && pan.y === lastPan.y) {
      // This means the user didn't drag the canvas, they just clicked it. We only want
      // to show the color picker if they click on a square, not drag, so we handle the
      // onClick event here rather than setting onClick on the canvas.
      handlePixelClick(e);
    }
  };

  const handlePixelClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const parent = parentRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !parent || scale === undefined) return;

    // Calculate offsets for centering the art.
    const offsets = getOffsets()!;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - pan.x) / scale - offsets.x);
    const y = Math.floor((e.clientY - rect.top - pan.y) / scale - offsets.y);

    // Quit out here if the click is outside the canvas.
    if (!(x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight)) {
      console.log("Clicked outside canvas");
      return;
    }

    setPopoverPos({ left: e.clientX - rect.left, top: e.clientY - rect.top });
    setOpenPopover(true);
  };

  const zoomIn = () => {
    setScale((scale) => scale! * 1.2);
  };

  const zoomOut = () => {
    setScale((scale) => scale! * 0.8);
  };

  const resetTransform = () => {
    setScale(initialScale);
    setPan({ x: 0, y: 0 });
    setLastMousePos({ x: 0, y: 0 });
  };

  const displayCanvasWidth = canvasWidth * (scale ?? 0);
  const displayCanvasHeight = canvasHeight * (scale ?? 0);
  const offsets = getOffsets()!;

  return (
    <StyledCanvasBox canvasData={canvasData}>
      <Box
        flex={1}
        bg="white"
        borderRadius={12}
        ref={parentRef}
        position="relative"
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", pointerEvents: "none" }}
          width={displayCanvasWidth}
          height={displayCanvasHeight}
        />
        {!drawModeOn && (
          <canvas
            ref={overlayRef}
            style={{ position: "absolute", cursor: "pointer" }}
            width={displayCanvasWidth}
            height={displayCanvasHeight}
            onMouseMove={handleMouseMoveOverlay}
            onMouseDown={handleMouseDownOverlay}
            onMouseUp={handleMouseUpOverlay}
          />
        )}
        {drawModeOn && (
          <DrawingCanvas
            drawingRef={drawingRef}
            squaresToDraw={squaresToDraw}
            setSquaresToDraw={setSquaresToDraw}
            displayCanvasWidth={displayCanvasWidth}
            displayCanvasHeight={displayCanvasHeight}
            offsets={offsets}
            scale={scale}
            pan={pan}
          />
        )}
        {!drawModeOn && (
          <ZoomButtons
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetTransform={resetTransform}
          />
        )}
        {drawModeOn && <SubmitDrawButton squaresToDraw={squaresToDraw} />}
        <CanvasPopover openPopover={openPopover} popoverPos={popoverPos} />
      </Box>
    </StyledCanvasBox>
  );
};
