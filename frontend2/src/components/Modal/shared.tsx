import { css, cx } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { Button } from "../Button";

export function ModalContent(props: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        css({
          bg: "surface",
          rounded: "xl",
          shadow: "md",
          p: 24,
          w: "90vw",
          maxW: "xl",
          maxH: "calc(100vh - 64px)",
          overflow: "auto",
        }),
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

export interface DeleteModalContentProps {
  heading: React.ReactNode;
  content: React.ReactNode;
  deleteLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  hide: () => void;
}

export function DeleteModalContent(props: DeleteModalContentProps) {
  return (
    <ModalContent className={stack({ gap: 24, maxW: "md" })}>
      <div className={stack({ gap: 8 })}>
        <h1 className={css({ textStyle: "heading.xl", textAlign: "center" })}>{props.heading}</h1>
        <div className={css({ textStyle: "body.md.regular", textAlign: "center" })}>
          {props.content}
        </div>
      </div>
      <div
        className={flex({ gap: 16, align: "center", justify: "stretch", "& button": { flex: 1 } })}
      >
        <Button size="md" variant="secondary" onClick={props.hide}>
          Cancel
        </Button>
        <Button size="md" variant="danger" loading={props.isLoading} onClick={props.onConfirm}>
          {props.deleteLabel ?? "Delete"}
        </Button>
      </div>
    </ModalContent>
  );
}
