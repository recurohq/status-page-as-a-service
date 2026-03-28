"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getSubscribers,
  addSubscriber,
  deleteSubscriber,
  exportSubscribersCSV,
} from "@/actions/subscribers";
import { getSetting } from "@/actions/settings";
import { formatDateTime, downloadBlob } from "@/lib/utils";
import { Plus, Trash2, Download } from "lucide-react";

type SubscriberDisplay = {
  id: number;
  email: string;
  verified: boolean;
  createdAt: string;
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberDisplay[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timezone, setTimezone] = useState<string | undefined>();

  const load = () => {
    getSubscribers().then(setSubscribers);
    getSetting("timezone").then((tz) => setTimezone(tz || undefined));
  };
  useEffect(() => { load(); }, []);

  async function handleAdd(formData: FormData) {
    await addSubscriber(formData);
    setDialogOpen(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this subscriber?")) return;
    await deleteSubscriber(id);
    load();
  }

  async function handleExport() {
    const csv = await exportSubscribersCSV();
    downloadBlob(csv, "subscribers.csv", "text/csv");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="hidden sm:inline-flex">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subscriber</DialogTitle>
              </DialogHeader>
              <form action={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="user@example.com"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add (verified)
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {subscribers.length === 0 && (
          <p className="text-muted-foreground">No subscribers yet.</p>
        )}
        {subscribers.map((sub) => (
          <div
            key={sub.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2"
          >
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              <span className="font-medium truncate">{sub.email}</span>
              <Badge variant={sub.verified ? "success" : "secondary"}>
                {sub.verified ? "Verified" : "Pending"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(sub.createdAt, timezone)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 self-end sm:self-auto"
              onClick={() => handleDelete(sub.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
