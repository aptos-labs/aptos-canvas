"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";

const END_DATE = new Date("October 18, 2023 12:00:00 PDT");

const getSecondsLeft = () => {
  const seconds = Math.round((END_DATE.valueOf() - Date.now()) / 1000);
  if (seconds < 0) return 0;
  return seconds;
};

export function Countdown() {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft());

  useEffect(() => {
    // Update counter once a minute since we're only displaying down to the minute
    const interval = window.setInterval(() => {
      setSecondsLeft(getSecondsLeft());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const days = secondsLeft / 60 / 60 / 24;
  const hours = (days % 1) * 24;
  const minutes = (hours % 1) * 60;

  const formattedDays = Math.floor(days);
  const formattedHours = Math.floor(hours);
  const formattedMinutes = Math.floor(minutes);

  return (
    <p className={wrapper}>
      <strong className={strongText}>
        {formattedDays} days {formattedHours} hours and {formattedMinutes} minutes until launch.
      </strong>{" "}
      <div className={css({ opacity: 0.4 })}>
        The Aptos Foundation reserves the right to moderate, edit, or clear the canvas.{" "}
        <Link
          href="https://aptoslabs.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className={css({ textDecoration: "underline", textUnderlineOffset: 2 })}
        >
          See terms.
        </Link>
      </div>
    </p>
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
