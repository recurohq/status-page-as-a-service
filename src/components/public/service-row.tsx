import { UptimeBars } from "./uptime-bars";
import { STATUS_LABELS, type DayData } from "@/lib/utils";
import type { Service } from "@/lib/db/schema";

const STATUS_DOT_COLORS: Record<string, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  partial_outage: "bg-orange-500",
  major_outage: "bg-red-500",
  maintenance: "bg-blue-500",
};

export function ServiceRow({
  service,
  uptimeData,
  timezone,
}: {
  service: Service;
  uptimeData: DayData[];
  timezone?: string;
}) {
  const isOperational = service.status === "operational";

  return (
    <div className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`status-dot ${STATUS_DOT_COLORS[service.status] ?? "bg-gray-400"} ${!isOperational ? "animate-status-pulse" : ""}`} />
          <span className="font-medium text-[14px] truncate">{service.name}</span>
        </div>
        <span className={`text-[12px] font-medium flex-shrink-0 ml-3 ${isOperational ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {STATUS_LABELS[service.status] ?? service.status}
        </span>
      </div>
      <UptimeBars days={uptimeData} timezone={timezone} />
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
