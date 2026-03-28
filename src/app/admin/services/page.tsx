"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getServices,
  createService,
  updateService,
  updateServiceStatus,
  deleteService,
} from "@/actions/services";
import { STATUS_LABELS, STATUS_BADGE_VARIANT, type ServiceStatus } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Service } from "@/lib/db/schema";

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as ServiceStatus[];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const load = () => getServices().then(setServices);
  useEffect(() => { load(); }, []);

  async function handleCreate(formData: FormData) {
    await createService(formData);
    setDialogOpen(false);
    load();
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    await updateService(editing.id, formData);
    setEditing(null);
    load();
  }

  async function handleStatusChange(id: number, status: ServiceStatus) {
    await updateServiceStatus(id, status);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this service?")) return;
    await deleteService(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editing.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  name="description"
                  defaultValue={editing.description ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  id="edit-status"
                  name="status"
                  defaultValue={editing.status}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-visible"
                  name="visible"
                  defaultChecked={editing.visible}
                />
                <Label htmlFor="edit-visible">Visible on status page</Label>
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {services.length === 0 && (
          <p className="text-muted-foreground">No services yet.</p>
        )}
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div>
                <span className="font-medium">{service.name}</span>
                {service.description && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {service.description}
                  </span>
                )}
                {!service.visible && (
                  <Badge variant="outline" className="ml-2">
                    Hidden
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={service.status}
                onChange={(e) =>
                  handleStatusChange(service.id, e.target.value as ServiceStatus)
                }
                className="w-44"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
              <Badge variant={STATUS_BADGE_VARIANT[service.status] ?? "secondary"}>
                {STATUS_LABELS[service.status]}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditing(service)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(service.id)}
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
