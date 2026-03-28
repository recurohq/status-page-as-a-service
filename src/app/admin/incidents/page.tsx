import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIncidents } from "@/actions/incidents";
import { getSetting } from "@/actions/settings";
import { IMPACT_LABELS, IMPACT_BADGE_VARIANT, INCIDENT_STATUS_LABELS, formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const [incidents, timezone] = await Promise.all([
    getIncidents(),
    getSetting("timezone"),
  ]);
  const tz = timezone || undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <Link href="/admin/incidents/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Incident
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {incidents.length === 0 && (
          <p className="text-muted-foreground">No incidents yet.</p>
        )}
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/admin/incidents/${incident.id}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors gap-2"
          >
            <div className="min-w-0">
              <span className="font-medium">{incident.title}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {formatDateTime(incident.createdAt, tz)}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={IMPACT_BADGE_VARIANT[incident.impact] ?? "secondary"}>
                {IMPACT_LABELS[incident.impact]}
              </Badge>
              <Badge
                variant={
                  incident.status === "resolved" ? "success" : "warning"
                }
              >
                {INCIDENT_STATUS_LABELS[incident.status]}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
