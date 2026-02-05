"use client";
import React, { memo } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

interface TimerDisplayProps {
  submissionDate: string;
  now: number;
}

export const TimerDisplay = memo(
  ({ submissionDate, now }: TimerDisplayProps) => {
    if (!submissionDate) return <span>-</span>;

    const start = new Date(submissionDate);
    const end = new Date(now);

    const days = differenceInDays(end, start);
    const hours = differenceInHours(end, start) % 24;
    const minutes = differenceInMinutes(end, start) % 60;

    let colorClass = "text-green-600";
    if (days >= 7) colorClass = "text-red-600 font-bold";
    else if (days >= 3) colorClass = "text-yellow-600 font-semibold";

    return (
      <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <span className="tabular-nums">
          {days > 0 ? `${days}d ` : ""}
          {hours > 0 ? `${hours}h ` : ""}
          {minutes}m
        </span>
      </div>
    );
  },
);

TimerDisplay.displayName = "TimerDisplay";
