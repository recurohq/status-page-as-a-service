"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createIncident } from "@/actions/incidents";
import { getServices } from "@/actions/services";
import { IMPACT_LABELS, INCIDENT_STATUS_LABELS } from "@/lib/utils";
import type { Service } from "@/lib/db/schema";

const INITIAL_STATUSES = ["investigating", "identified", "monitoring"] as const;

export default function NewIncidentPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getServices().then(setServices);
  }, []);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    const id = await createIncident(formData);
    router.push(`/admin/incidents/${id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Incident</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="e.g. API Gateway Timeout" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impact">Impact</Label>
                <Select id="impact" name="impact">
                  {Object.entries(IMPACT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select id="status" name="status">
                  {INITIAL_STATUSES.map((s) => (
                    <option key={s} value={s}>{INCIDENT_STATUS_LABELS[s]}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Affected Services</Label>
              <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-auto">
                {services.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No services created yet.
                  </p>
                )}
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="serviceIds"
                      value={service.id}
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Initial Message (Markdown)</Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Describe what's happening..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating..." : "Create Incident"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
