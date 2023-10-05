import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { PaintIcon } from "../Icons/PaintIcon";

export function PaintInfo() {
  // TODO: Get actual PNT balance
  const pntBalance = 10_000;

  return (
    <div className={stack({ align: "center", gap: 16, color: "text" })}>
      <PaintIcon />
      <div className={css({ textStyle: "body.sm.regular", textAlign: "center" })}>
        {pntBalance.toLocaleString()} <br /> PTN
      </div>
    </div>
  );
}
