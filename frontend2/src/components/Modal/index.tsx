"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useState } from "react";

import { preventEventDefault } from "@/utils/event";

import { BaseModalProps, contentStyles, overlayStyles } from "./helpers";

export * from "./ImperativeModal";
export * from "./shared";

export interface ModalProps extends BaseModalProps {
  /**
   * The element that should open the modal when clicked.
   * The element should be an HTML `button` that can accept a ref.
   * You may need to wrap your component in React.forwardRef.
   */
  trigger: JSX.Element;
}

export function Modal({ trigger, content, dismissible = true }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hide = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayStyles} />
        <Dialog.Content
          className={contentStyles}
          onEscapeKeyDown={dismissible ? undefined : preventEventDefault}
          onPointerDownOutside={dismissible ? undefined : preventEventDefault}
          onInteractOutside={dismissible ? undefined : preventEventDefault}
        >
          {content({ hide })}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
