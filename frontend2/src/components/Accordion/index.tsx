import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ReactNode } from "react";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { ChevronIcon } from "../Icons/ChevronIcon";

export interface AccordionProps {
  trigger: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

export function Accordion({ trigger, children, isExpanded, setIsExpanded }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      value={isExpanded ? "item" : ""}
      onValueChange={(value) => {
        setIsExpanded(!!value);
      }}
    >
      <AccordionPrimitive.Item value="item" className={stack({ gap: 16 })}>
        <AccordionPrimitive.Header className={flex({ justifyContent: "center" })}>
          <AccordionPrimitive.Trigger className={triggerStyles}>
            {trigger}
            <ChevronIcon direction={isExpanded ? "up" : "down"} />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className={contentStyles}>
          {children}
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
}

const triggerStyles = flex({
  gap: 16,
  align: "center",
  justify: "space-between",
  textStyle: "body.md.regular",
  color: "text.secondary",
  cursor: "pointer",
});

const contentStyles = css({
  overflow: "hidden",
  "&[data-state='open']": {
    animation: "accordionOpen token(durations.1) ease-out",
  },
  "&[data-state='closed']": {
    animation: "accordionClose token(durations.1) ease-out",
  },
});
