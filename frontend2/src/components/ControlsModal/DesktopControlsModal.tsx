import { Fragment } from "react";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { useCanvasState } from "@/contexts/canvas";

import { CloseIcon } from "../Icons/CloseIcon";
import { ModalContent, openModal } from "../Modal";

export function openDesktopControlsModal() {
  openModal({
    id: "desktop-controls-modal",
    content: ({ hide }) => <DesktopControlsModal hide={hide} />,
  });
}

interface DesktopControlsModalProps {
  hide: () => void;
}

function DesktopControlsModal({ hide }: DesktopControlsModalProps) {
  const isViewOnly = useCanvasState((s) => s.isViewOnly);

  return (
    <ModalContent className={stack({ gap: 24 })}>
      <div className={flex({ align: "center", justify: "space-between", gap: 16 })}>
        <h1 className={css({ textStyle: "body.lg.bold" })}>
          {isViewOnly ? "View" : "Draw"} Mode Controls
        </h1>
        <button aria-label="close" onClick={hide}>
          <CloseIcon className={css({ color: "text.secondary" })} />
        </button>
      </div>
      <ControlsGrid controlsMap={isViewOnly ? viewModeControls : drawModeControls} />
    </ModalContent>
  );
}

/** Mapping of action to controls to perform action */
type ControlsMap = Record<string, Array<string>>;

const viewModeControls: ControlsMap = {
  Zoom: ["Hold the Ctrl key and scroll up or down", "Pinch to zoom on a trackpad"],
  Pan: ["Click on the canvas and drag it around"],
  "Reset View": ["Press the R key"],
  "Set Line Color": ["Press a key 1 through 8"],
  "Set Line Width": ["Hold Shift and press a key 1 through 8"],
};

const drawModeControls: ControlsMap = {
  Zoom: ["Hold the Ctrl key and scroll up or down", "Pinch to zoom on a trackpad"],
  Pan: ["Hold the Alt/Option key, click on the canvas and drag it around"],
  "Reset View": ["Press the R key"],
  Undo: ["Ctrl+Z on Windows and Cmd+Z on Mac"],
  "View Coordinates": ["Press the D key"],
  "Set Line Color": ["Press a key 1 through 8"],
  "Set Line Width": ["Hold Shift and press a key 1 through 8"],
};

function ControlsGrid({ controlsMap }: { controlsMap: ControlsMap }) {
  return (
    <div className={grid}>
      {Object.entries(controlsMap).map(([action, controls]) => (
        <Fragment key={action}>
          <div className={css({ textAlign: "right", color: "text.secondary" })}>{action}</div>
          <div className={stack({ gap: 2 })}>
            {controls.map((control, i) => (
              <Fragment key={control}>
                <p>{control}</p>
                {i !== controls.length - 1 && (
                  <div className={css({ textStyle: "body.sm.bold", color: "text.secondary" })}>
                    OR
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

const grid = css({
  alignSelf: "center",
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  columnGap: 24,
  rowGap: 24,
  px: 16,
  py: 8,
});
