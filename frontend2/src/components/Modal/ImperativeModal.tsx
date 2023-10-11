"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useRef, useState } from "react";
import { token } from "styled-system/tokens";

import { preventEventDefault } from "@/utils/event";
import { createEventEmitter } from "@/utils/eventEmitter";

import { BaseModalProps, contentStyles, overlayStyles } from "./helpers";

export { ModalContainer, openModal };
export type { OpenModalArgs };

const [openModal, useModalListener] = createEventEmitter<OpenModalArgs>("modal");

interface OpenModalArgs extends Omit<ImperativeModalProps, "onDismiss"> {
  id: string;
}

function ModalContainer() {
  const [modalMap, setModalMap] = useState<Map<string, OpenModalArgs>>(new Map());

  const removeModal = useCallback((modalId: string) => {
    setModalMap((prev) => {
      const next = new Map(prev);
      next.delete(modalId);
      return next;
    });
  }, []);

  const addModal = useCallback((payload: OpenModalArgs) => {
    setModalMap((prev) => {
      const next = new Map(prev);
      next.set(payload.id, payload);
      return next;
    });
  }, []);

  useModalListener(addModal);

  if (!modalMap.size) return null;

  return (
    <>
      {Array.from(modalMap.values()).map(({ id, ...modalProps }) => (
        <ImperativeModal
          key={id}
          onDismiss={() => {
            removeModal(id);
          }}
          {...modalProps}
        />
      ))}
    </>
  );
}

interface ImperativeModalProps extends BaseModalProps {
  /** A callback to be invoked when the modal is dismissed */
  onDismiss: () => void;
}

function ImperativeModal({ content, onDismiss, dismissible = true }: ImperativeModalProps) {
  // Hold a reference to the element that triggered the modal
  const lastFocusedElement = useRef(document.activeElement as HTMLElement | null);
  const [isOpen, setIsOpen] = useState(true);

  const scheduleDismiss = () => {
    // Add timeout to dismiss function to allow time for exit animation
    window.setTimeout(onDismiss, parseFloat(token("durations.1")) * 1000);
  };

  const hide = () => {
    setIsOpen(false);
    scheduleDismiss();
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) scheduleDismiss();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayStyles} />
        <Dialog.Content
          className={contentStyles}
          onEscapeKeyDown={dismissible ? undefined : preventEventDefault}
          onPointerDownOutside={dismissible ? undefined : preventEventDefault}
          onInteractOutside={dismissible ? undefined : preventEventDefault}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            // Return focus back to the element that triggered the modal
            lastFocusedElement.current?.focus();
          }}
        >
          {content({ hide })}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
