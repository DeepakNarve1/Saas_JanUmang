"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface TimeElapsedProps {
  date: string | Date;
}

export const TimeElapsed = ({ date }: TimeElapsedProps) => {
  const [elapsed, setElapsed] = useState<string>("");

  useEffect(() => {
    if (!date) return;

    const updateDistance = () => {
      try {
        const d = typeof date === "string" ? new Date(date) : date;
        if (isNaN(d.getTime())) {
          setElapsed("-");
          return;
        }
        setElapsed(formatDistanceToNow(d, { addSuffix: true }));
      } catch (err) {
        setElapsed("-");
      }
    };

    updateDistance();
    const interval = setInterval(updateDistance, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <span className="text-xs font-mono">{elapsed || "-"}</span>;
};
