import Image from "next/image";
import { useEffect } from "react";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { CloseIcon } from "../Icons/CloseIcon";
import { ModalContent, openModal } from "../Modal";

const STORAGE_KEY = "shown-mobile-controls";

export function openMobileControlsModal() {
  // Only show the user these controls once per session
  if (window.sessionStorage.getItem(STORAGE_KEY)) {
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, "true");

  openModal({
    id: "mobile-controls-modal",
    content: ({ hide }) => <MobileControlsModal hide={hide} />,
  });
}

interface MobileControlsModalProps {
  hide: () => void;
}

function MobileControlsModal({ hide }: MobileControlsModalProps) {
  // Auto-close modal after 4 seconds
  useEffect(() => {
    const timeout = window.setTimeout(hide, 4000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [hide]);

  return (
    <ModalContent className={stack({ p: 16, gap: 0 })}>
      <div className={flex({ justify: "flex-end" })}>
        <button
          aria-label="close"
          onClick={hide}
          className={css({
            rounded: "full",
            p: 4,
            m: -4,
            _focus: { outline: "none", bg: "focusBg" },
          })}
        >
          <CloseIcon className={css({ color: "text.secondary" })} />
        </button>
      </div>
      <div className={stack({ gap: 0, align: "center" })}>
        <Image
          priority
          src="/images/pinch-gesture.png"
          alt="Pinch Gesture"
          width={268}
          height={242}
          className={css({ _dark: { filter: "invert(1)" } })}
        />
        <p className={css({ textStyle: "body.md.medium", py: 16 })}>
          Pinch to zoom/pan to see the whole canvas!
        </p>
      </div>
    </ModalContent>
  );
}
