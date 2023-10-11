"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { Skeleton } from "@/components/Skeleton";
import { PIXELS_PER_SIDE } from "@/constants/canvas";
import { APP_CONFIG } from "@/constants/config";
import { useAptosNetworkState } from "@/contexts/wallet";
import { isServer } from "@/utils/isServer";
import { getPixelArrayFromImageElement } from "@/utils/tempCanvas";

import { CanvasOverlay } from "./CanvasOverlay";

export function CanvasContainer() {
  const [canvasContainer, containerBounds] = useMeasure();
  const network = useAptosNetworkState((s) => s.network);
  const { height, width } = containerBounds;
  const hasSize = Boolean(height && width);

  const [baseImage, setBaseImage] = useState<Uint8ClampedArray>();

  useEffect(() => {
    if (isServer()) return;

    const fetchBaseImage = () => {
      const img = new Image();
      img.src = APP_CONFIG[network].canvasImageUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const [pixelArray, cleanUp] = getPixelArrayFromImageElement(img, PIXELS_PER_SIDE);
        if (pixelArray) setBaseImage(pixelArray);
        cleanUp();
      };
    };

    // Immediately fetch base image
    fetchBaseImage();
    // Fetch base image every 3 seconds following the first call above
    const interval = window.setInterval(fetchBaseImage, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [network]);

  return (
    <div
      ref={canvasContainer}
      className={flex({
        position: "relative",
        height: "100%",
        width: "100%",
        justify: "center",
        overflow: "hidden",
        rounded: "md",
      })}
    >
      {hasSize && baseImage ? (
        <Canvas height={height} width={width} baseImage={baseImage} />
      ) : (
        canvasSkeleton
      )}
      <CanvasOverlay />
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
