"use client";

import { cn } from "@/lib/utils";
import { IMPACT_LABELS, type DayData } from "@/lib/utils";

const IMPACT_BAR_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  major: "bg-orange-500",
  minor: "bg-amber-400",
  none: "bg-emerald-400",
};

export function UptimeBars({ days, timezone }: { days: DayData[]; timezone?: string }) {
  const dateOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  if (timezone) dateOpts.timeZone = timezone;

  return (
    <div className="flex gap-px items-end h-8">
      {days.map((day) => (
        <div
          key={day.date}
          className="group/bar relative flex-1 min-w-[2px]"
        >
          <div
            className={cn(
              "w-full h-8 rounded-sm transition-all group-hover/bar:opacity-80",
              day.impact
                ? IMPACT_BAR_COLORS[day.impact] || "bg-emerald-400"
                : "bg-emerald-400"
            )}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:block z-20 tooltip-enter pointer-events-none">
            <div className="bg-foreground text-background text-[11px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
              <div className="font-medium">
                {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", dateOpts)}
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">
                {day.impact
                  ? `${IMPACT_LABELS[day.impact] ?? day.impact} impact`
                  : "No incidents"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
