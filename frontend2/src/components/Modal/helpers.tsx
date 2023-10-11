import { css } from "styled-system/css";

export interface BaseModalProps {
  /** A function that returns a ReactNode to be rendered as the dialog content. */
  content: (renderProps: { hide: () => void }) => React.ReactNode;
  /**
   * Whether or not the modal should be closed after one of the following interactions:
   * - The escape key is pressed
   * - Any interaction event (pointer or focus) occurs outside of the modal element
   */
  dismissible?: boolean;
}

export const overlayStyles = css({
  zIndex: "dialog",
  position: "fixed",
  inset: 0,
  bg: "dialogOverlay",
  "&[data-state='open']": {
    animation: "fadeIn token(durations.1) ease",
  },
  "&[data-state='closed']": {
    animation: "fadeOut token(durations.1) ease",
  },
});

export const contentStyles = css({
  zIndex: "dialog",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(0)",
  "&[data-state='open']": {
    animation: "dialogScaleIn token(durations.1) ease forwards",
  },
  "&[data-state='closed']": {
    animation: "dialogScaleOut token(durations.1) ease",
  },
});
