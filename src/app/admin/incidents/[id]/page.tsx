"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  getIncident,
  getIncidentUpdates,
  getIncidentServices,
  postIncidentUpdate,
} from "@/actions/incidents";
import { getSetting } from "@/actions/settings";
import {
  IMPACT_LABELS,
  INCIDENT_STATUS_LABELS,
  formatDateTime,
} from "@/lib/utils";
import type { Incident, IncidentUpdate } from "@/lib/db/schema";

export default function IncidentDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [incident, setIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [affectedServices, setAffectedServices] = useState<
    { serviceId: number; serviceName: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [timezone, setTimezone] = useState<string | undefined>();

  const load = () => {
    getIncident(id).then((inc) => setIncident(inc ?? null));
    getIncidentUpdates(id).then(setUpdates);
    getIncidentServices(id).then(setAffectedServices);
    getSetting("timezone").then((tz) => setTimezone(tz || undefined));
  };

  useEffect(() => {
    load();
  }, [id]);

  async function handlePostUpdate(formData: FormData) {
    setSubmitting(true);
    await postIncidentUpdate(id, formData);
    setSubmitting(false);
    load();
  }

  if (!incident) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{incident.title}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge
            variant={
              incident.status === "resolved" ? "success" : "warning"
            }
          >
            {INCIDENT_STATUS_LABELS[incident.status]}
          </Badge>
          <Badge variant="secondary">{IMPACT_LABELS[incident.impact]}</Badge>
          {affectedServices.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Affecting: {affectedServices.map((s) => s.serviceName).join(", ")}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Started {formatDateTime(incident.startedAt, timezone)}
          {incident.resolvedAt &&
            ` — Resolved ${formatDateTime(incident.resolvedAt, timezone)}`}
        </p>
      </div>

      {/* Post update */}
      {incident.status !== "resolved" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Post Update</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handlePostUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={incident.status}>
                  {Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (Markdown)</Label>
                <Textarea id="message" name="message" rows={3} required />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Posting..." : "Post Update"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Updates</h2>
        {updates.length === 0 && (
          <p className="text-muted-foreground text-sm">No updates yet.</p>
        )}
        <div className="space-y-3 border-l-2 border-muted pl-4 ml-2">
          {updates.map((update) => (
            <div key={update.id}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-sm">
                  {INCIDENT_STATUS_LABELS[update.status] ?? update.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(update.createdAt, timezone)}
                </span>
              </div>
              <p className="text-sm">{update.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
