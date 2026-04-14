"use client";

import { useEffect, useState } from "react";

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

function getRelativeTimeString(date: Date | string): string {
  const timeMs = new Date(date).getTime();
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];
  const units: Intl.RelativeTimeFormatUnit[] = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
  ];
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds)
  );
  const divider = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(Math.floor(deltaSeconds / divider), units[unitIndex]);
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    setTimeStr(getRelativeTimeString(date));
    const interval = setInterval(() => {
      setTimeStr(getRelativeTimeString(date));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return <span className={className}>{timeStr || "just now"}</span>;
}
