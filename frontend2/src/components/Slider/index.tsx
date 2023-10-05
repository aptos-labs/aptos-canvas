"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  orientation: "vertical" | "horizontal";
  min: number;
  max: number;
  step: number;
}

export function Slider(props: SliderProps) {
  return (
    <SliderPrimitive.Root
      value={[props.value]}
      onValueChange={(value) => {
        props.onChange(value[0] ?? props.min);
      }}
      orientation={props.orientation}
      min={props.min}
      max={props.max}
      step={props.step}
      className={root}
    >
      <SliderPrimitive.Track className={track}>
        <SliderPrimitive.Range className={range} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={thumb}>
        <div className={css({ textStyle: "body.sm.regular", opacity: 0.4 })}>{props.value}</div>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
}

const root = flex({
  position: "relative",
  "&[data-orientation='horizontal']": {
    h: 20,
  },
  "&[data-orientation='vertical']": {
    flexDirection: "column",
    w: 20,
    h: 176, // TODO: Maybe make this height configurable for vertical orientations
  },
});

const track = css({
  position: "relative",
  flexGrow: 1,
  alignSelf: "center",
  rounded: "full",
  bg: "border",
  "&[data-orientation='horizontal']": {
    h: 3,
  },
  "&[data-orientation='vertical']": {
    w: 3,
  },
});

const range = css({
  position: "absolute",
  bg: "black",
  rounded: "full",
  "&[data-orientation='horizontal']": {
    h: "100%",
  },
  "&[data-orientation='vertical']": {
    w: "100%",
  },
});

const thumb = flex({
  align: "center",
  justify: "center",
  rounded: "full",
  h: 20,
  w: 20,
  bg: "surface",
  color: "text",
  filter: "drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.3))",
  cursor: "grab",
  _active: {
    cursor: "grabbing",
  },
});
