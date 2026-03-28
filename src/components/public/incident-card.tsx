import { Badge } from "@/components/ui/badge";
import { IMPACT_LABELS, IMPACT_BADGE_VARIANT, INCIDENT_STATUS_LABELS, formatDateTime } from "@/lib/utils";
import { marked } from "marked";
import type { Incident, IncidentUpdate } from "@/lib/db/schema";

const STATUS_DOT: Record<string, string> = {
  investigating: "bg-red-500",
  identified: "bg-orange-500",
  monitoring: "bg-blue-500",
  resolved: "bg-emerald-500",
};

export function IncidentCard({
  incident,
  updates,
  affectedServices,
  timezone,
}: {
  incident: Incident;
  updates: IncidentUpdate[];
  affectedServices: { serviceId: number; serviceName: string }[];
  timezone?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px]">{incident.title}</h3>
          {affectedServices.length > 0 && (
            <p className="text-[12px] text-muted-foreground mt-1">
              {affectedServices.map((s) => s.serviceName).join(", ")}
            </p>
          )}
        </div>
        <Badge variant={IMPACT_BADGE_VARIANT[incident.impact] ?? "secondary"} className="flex-shrink-0">
          {IMPACT_LABELS[incident.impact] ?? incident.impact}
        </Badge>
      </div>
      {updates.length > 0 && (
        <div className="space-y-0">
          {updates.map((update, i) => (
            <div key={update.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`status-dot mt-1.5 ${STATUS_DOT[update.status] ?? "bg-gray-400"}`} />
                {i < updates.length - 1 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className={`pb-4 min-w-0 flex-1 ${i === updates.length - 1 ? "pb-0" : ""}`}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-[13px]">
                    {INCIDENT_STATUS_LABELS[update.status] ?? update.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateTime(update.createdAt, timezone)}
                  </span>
                </div>
                {/* Content is from authenticated admin only — trusted input */}
                <div
                  className="text-[13px] text-muted-foreground mt-1 prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: marked(update.message, { async: false }) as string,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
