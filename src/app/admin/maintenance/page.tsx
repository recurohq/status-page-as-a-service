"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getMaintenanceList,
  createMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
} from "@/actions/maintenance";
import { getServices } from "@/actions/services";
import { getSetting } from "@/actions/settings";
import { formatDateTime, MAINTENANCE_STATUS_LABELS, MAINTENANCE_BADGE_VARIANT, type MaintenanceStatus } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Maintenance, Service } from "@/lib/db/schema";

export default function MaintenancePage() {
  const [items, setItems] = useState<Maintenance[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timezone, setTimezone] = useState<string | undefined>();

  const load = () => {
    getMaintenanceList().then(setItems);
    getServices().then(setServices);
    getSetting("timezone").then((tz) => setTimezone(tz || undefined));
  };
  useEffect(() => { load(); }, []);

  async function handleCreate(formData: FormData) {
    await createMaintenance(formData);
    setDialogOpen(false);
    load();
  }

  async function handleStatusChange(id: number, status: MaintenanceStatus) {
    await updateMaintenanceStatus(id, status);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this maintenance window?")) return;
    await deleteMaintenance(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Schedule</span> Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Markdown)</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledStart">Start</Label>
                  <Input
                    id="scheduledStart"
                    name="scheduledStart"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledEnd">End</Label>
                  <Input
                    id="scheduledEnd"
                    name="scheduledEnd"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Affected Services</Label>
                <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-auto">
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
              <Button type="submit" className="w-full">
                Schedule
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-muted-foreground">No maintenance scheduled.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
          >
            <div className="min-w-0">
              <span className="font-medium">{item.title}</span>
              <div className="text-sm text-muted-foreground">
                {formatDateTime(item.scheduledStart, timezone)} &mdash;{" "}
                {formatDateTime(item.scheduledEnd, timezone)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={MAINTENANCE_BADGE_VARIANT[item.status] ?? "secondary"}>
                {MAINTENANCE_STATUS_LABELS[item.status] ?? item.status}
              </Badge>
              {item.status === "scheduled" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(item.id, "in_progress")}
                >
                  Start
                </Button>
              )}
              {item.status === "in_progress" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(item.id, "completed")}
                >
                  Complete
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
