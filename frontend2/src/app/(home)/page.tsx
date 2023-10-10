import { css } from "styled-system/css";

import { CanvasContainer } from "./CanvasContainer";
import { DesktopCanvasHeader } from "./DesktopCanvasHeader";
import { DesktopSidePanel } from "./DesktopSidePanel";
import { MobileCanvasFooter } from "./MobileCanvasFooter";
import { MobileCanvasHeader } from "./MobileCanvasHeader";
import { MobileCanvasSidePanel } from "./MobileCanvasSidePanel";
import { MobileHeader } from "./MobileHeader";

export default function HomePage() {
  return (
    <div className={wrapper}>
      <DesktopSidePanel />
      <MobileHeader />
      <main className={main}>
        <DesktopCanvasHeader />
        <MobileCanvasHeader />
        <div className={canvasWrapper}>
          <MobileCanvasSidePanel />
          <CanvasContainer />
        </div>
        <MobileCanvasFooter />
      </main>
    </div>
  );
}

const wrapper = css({
  h: "100svh",
  w: "100vw",
  overflow: "hidden",
  bg: "surface.secondary",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  md: {
    display: "grid",
    gridTemplateRows: "unset",
    gridTemplateColumns: "auto minmax(0, 1fr)",
  },
});

const main = css({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  p: 16,
  pt: 12,
  gap: 12,
  md: {
    display: "flex",
    flexDir: "column",
    p: 32,
    gap: 24,
  },
});

const canvasWrapper = css({
  h: "100%",
  w: "100%",
  position: "relative",
});
