"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { Skeleton } from "@/components/Skeleton";
import { PIXELS_PER_SIDE } from "@/constants/canvas";
import { isServer } from "@/utils/isServer";

export function CanvasContainer() {
  const [canvasContainer, containerBounds] = useMeasure();
  const { height, width } = containerBounds;
  const hasSize = Boolean(height && width);

  const [showGrid] = useState(true);
  const [image, setImage] = useState<Uint8ClampedArray>();

  useEffect(() => {
    // TODO: Eventually fetch the image from an API endpoint and poll for updates
    if (isServer()) return;
    const img = new Image();
    img.src = "/images/initialCanvas.png";
    img.onload = () => {
      let tempCanvas: HTMLCanvasElement | null = document.createElement("canvas");
      tempCanvas.setAttribute("id", "_temp_canvas");
      tempCanvas.width = PIXELS_PER_SIDE;
      tempCanvas.height = PIXELS_PER_SIDE;
      const context = tempCanvas.getContext("2d");
      context?.drawImage(img, 0, 0);
      const imageData = context?.getImageData(0, 0, PIXELS_PER_SIDE, PIXELS_PER_SIDE);
      if (imageData?.data) setImage(imageData.data);
      tempCanvas = null;
      document.getElementById("#_temp_canvas")?.remove();
    };
  }, []);

  return (
    <div
      ref={canvasContainer}
      className={flex({
        height: "100%",
        width: "100%",
        justify: "center",
        overflow: "hidden",
        rounded: "md",
      })}
    >
      {hasSize && image ? (
        <Canvas height={height} width={width} showGrid={showGrid} initialImage={image} />
      ) : (
        canvasSkeleton
      )}
    </div>
  );
}

const Canvas = dynamic(
  async () => {
    const { Canvas } = await import("@/components/Canvas");
    return { default: Canvas };
  },
  {
    loading: () => canvasSkeleton,
    ssr: false,
  },
);

const canvasSkeleton = (
  <Skeleton key="canvas-skeleton" className={css({ h: "100%", w: "100%", rounded: "md" })} />
);
