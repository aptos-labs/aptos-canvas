"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";

import { emitCanvasCommand, useCanvasState } from "@/contexts/canvas";

const END_DATE = new Date(process.env.NEXT_PUBLIC_EVENT_END_DATE ?? new Date());

const getSecondsLeft = () => {
  const seconds = Math.round((END_DATE.valueOf() - Date.now()) / 1000);
  if (seconds < 0) return 0;
  return seconds;
};

export function Countdown() {
  const [secondsLeft, setSecondsLeft] = useState<number>();
  const isEventOver = useCanvasState(
    (s) => s.isEventComplete || process.env.NEXT_PUBLIC_MINT_COMPLETE,
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PAUSE_EVENT) return;

    if (secondsLeft !== undefined && secondsLeft <= 0) {
      if (!useCanvasState.getState().canDrawUnlimited) {
        emitCanvasCommand("clearChangedPixels");
        useCanvasState.setState({ isViewOnly: true });
      }
      useCanvasState.setState({ isEventComplete: true });
      return;
    }

    setSecondsLeft(getSecondsLeft());

    // Update counter once a minute since we're only displaying down to the minute
    const interval = window.setInterval(() => {
      setSecondsLeft(getSecondsLeft());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [secondsLeft]);

  const days = secondsLeft !== undefined ? secondsLeft / 60 / 60 / 24 : 0;
  const hours = (days % 1) * 24;
  const minutes = (hours % 1) * 60;

  const formattedDays = secondsLeft !== undefined ? Math.floor(days) : "X";
  const formattedHours = secondsLeft !== undefined ? Math.floor(hours) : "X";
  const formattedMinutes = secondsLeft !== undefined ? Math.floor(minutes) : "X";

  return (
    <div className={wrapper}>
      <p className={strongText}>
        {isEventOver
          ? "This event is now closed."
          : `${formattedDays} days ${formattedHours} hours and ${formattedMinutes} minutes until close.`}
      </p>{" "}
      <p className={css({ opacity: 0.4 })}>
        Graffio moderators reserve the right to edit or clear the canvas.{" "}
        <Link
          href="https://aptoslabs.notion.site/Graffio-How-to-Draw-Rules-of-Play-88b5b2e7702448fabf54edeab5e107ab"
          target="_blank"
          rel="noopener noreferrer"
          className={css({ textDecoration: "underline", textUnderlineOffset: 2 })}
        >
          Rules
        </Link>
        {", "}
        <Link
          href="https://aptoslabs.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className={css({ textDecoration: "underline", textUnderlineOffset: 2 })}
        >
          Terms
        </Link>
        {", "}
        <Link
          href="https://aptoslabs.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className={css({ textDecoration: "underline", textUnderlineOffset: 2 })}
        >
          Privacy
        </Link>
      </p>
    </div>
  );
}

const wrapper = css({
  display: "flex",
  flexDirection: "column",
  textStyle: "body.sm.regular",
  md: {
    display: "block",
    textStyle: "body.md.regular",
  },
});

const strongText = css({
  textStyle: { base: "body.sm.bold", md: "body.md.bold" },
});
