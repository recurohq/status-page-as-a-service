import { CheckCircle2, AlertTriangle, XOctagon, Wrench } from "lucide-react";
import type { Service } from "@/lib/db/schema";

export function StatusBanner({ services }: { services: Service[] }) {
  const statuses = services.map((s) => s.status);

  let text = "All Systems Operational";
  let description = "Everything is running smoothly.";
  let dotColor = "bg-emerald-500";
  let bgClass = "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10";
  let textColor = "text-emerald-700 dark:text-emerald-400";
  let Icon = CheckCircle2;
  let pulse = false;

  if (statuses.some((s) => s === "major_outage")) {
    text = "Major System Outage";
    description = "One or more systems are experiencing a major outage.";
    dotColor = "bg-red-500";
    bgClass = "bg-red-500/5 border-red-500/20 dark:bg-red-500/10";
    textColor = "text-red-700 dark:text-red-400";
    Icon = XOctagon;
    pulse = true;
  } else if (statuses.some((s) => s === "partial_outage")) {
    text = "Partial System Outage";
    description = "Some systems are experiencing issues.";
    dotColor = "bg-orange-500";
    bgClass = "bg-orange-500/5 border-orange-500/20 dark:bg-orange-500/10";
    textColor = "text-orange-700 dark:text-orange-400";
    Icon = AlertTriangle;
    pulse = true;
  } else if (statuses.some((s) => s === "degraded")) {
    text = "Degraded Performance";
    description = "Some systems are experiencing degraded performance.";
    dotColor = "bg-amber-500";
    bgClass = "bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10";
    textColor = "text-amber-700 dark:text-amber-400";
    Icon = AlertTriangle;
  } else if (statuses.some((s) => s === "maintenance")) {
    text = "Maintenance In Progress";
    description = "Scheduled maintenance is currently underway.";
    dotColor = "bg-blue-500";
    bgClass = "bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10";
    textColor = "text-blue-700 dark:text-blue-400";
    Icon = Wrench;
  }

  return (
    <div className={`rounded-xl border p-5 ${bgClass}`}>
      <div className="flex items-start gap-3.5">
        <div className={`status-dot-lg mt-0.5 ${dotColor} ${pulse ? "animate-status-pulse" : ""}`} />
        <div>
          <h1 className={`text-[15px] font-semibold ${textColor}`}>{text}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
