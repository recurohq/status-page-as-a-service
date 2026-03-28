import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDateTime, MAINTENANCE_STATUS_LABELS, MAINTENANCE_BADGE_VARIANT } from "@/lib/utils";
import { marked } from "marked";
import type { Maintenance } from "@/lib/db/schema";

export function MaintenanceCard({
  item,
  affectedServices,
  timezone,
}: {
  item: Maintenance;
  affectedServices: { serviceId: number; serviceName: string }[];
  timezone?: string;
}) {
  return (
    <div className="rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-[14px]">{item.title}</h3>
            <Badge variant={MAINTENANCE_BADGE_VARIANT[item.status] ?? "info"} className="flex-shrink-0">
              {MAINTENANCE_STATUS_LABELS[item.status] ?? item.status}
            </Badge>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {formatDateTime(item.scheduledStart, timezone)} &mdash; {formatDateTime(item.scheduledEnd, timezone)}
          </p>
          {affectedServices.length > 0 && (
            <p className="text-[12px] text-muted-foreground">
              {affectedServices.map((s) => s.serviceName).join(", ")}
            </p>
          )}
          {/* Content is from authenticated admin only — trusted input */}
          {item.description && (
            <div
              className="text-[13px] text-muted-foreground mt-2 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: marked(item.description, { async: false }) as string,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
