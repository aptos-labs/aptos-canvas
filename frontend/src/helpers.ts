import moment from "moment";

export function hexToRgb(hex: string) {
  console.log("Hex color: ", hex);
  if (hex.includes("Nan")) {
    return null;
  }
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function truncateAddress(accountAddress: string) {
  return truncate(accountAddress, 6, 4, "…");
}

function truncate(
  str: string,
  frontLen: number,
  backLen: number,
  truncateStr: string,
) {
  if (!str) {
    return "";
  }

  if (!Number.isInteger(frontLen) || !Number.isInteger(backLen)) {
    throw `${frontLen} and ${backLen} should be an Integer`;
  }

  var strLen = str.length;
  // Setting default values
  frontLen = frontLen;
  backLen = backLen;
  truncateStr = truncateStr || "…";
  if (
    (frontLen === 0 && backLen === 0) ||
    frontLen >= strLen ||
    backLen >= strLen ||
    frontLen + backLen >= strLen
  ) {
    return str;
  } else if (backLen === 0) {
    return str.slice(0, frontLen) + truncateStr;
  } else {
    return str.slice(0, frontLen) + truncateStr + str.slice(strLen - backLen);
  }
}

export function getLocalTime(timestamp: string): string {
  return moment(ensureMillisecondTimestamp(timestamp))
    .local()
    .format("MMMM D, YYYY [at] hh:mm A");
}

function ensureMillisecondTimestamp(timestamp: string): number {
  /*
  Could be: 1646458457
        or: 1646440953658538
   */
  if (timestamp.length > 13) {
    timestamp = timestamp.slice(0, 13);
  }
  if (timestamp.length == 10) {
    timestamp = timestamp + "000";
  }
  return parseInt(timestamp);
}

export function getTimeLeft(timestamp: string) {
  const now = moment();
  const expiry = moment(ensureMillisecondTimestamp(timestamp));
  const duration = moment.duration(expiry.diff(now));

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();

  let formattedTime = "";

  if (days > 0) {
    formattedTime = `${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    formattedTime = `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    formattedTime = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  return {
    expiring: days < 1,
    formattedTime,
  };
}
