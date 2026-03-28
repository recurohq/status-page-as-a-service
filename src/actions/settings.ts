"use server";

import { db } from "@/lib/db";
import {
  settings,
  services,
  incidents,
  incidentUpdates,
  incidentServices,
  maintenance,
  maintenanceServices,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SETTING_KEYS } from "@/lib/utils";

export async function getSetting(key: string): Promise<string | null> {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = db.select().from(settings).all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSetting(key: string, value: string) {
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}

export async function saveSettings(formData: FormData) {
  for (const key of SETTING_KEYS) {
    const value = formData.get(key) as string;
    if (value !== null && value !== undefined) {
      await setSetting(key, value);
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function exportData() {
  const allServices = db.select().from(services).all();
  const allIncidents = db.select().from(incidents).all();
  const allUpdates = db.select().from(incidentUpdates).all();
  const allIncidentServices = db.select().from(incidentServices).all();
  const allMaintenance = db.select().from(maintenance).all();
  const allMaintenanceServices = db.select().from(maintenanceServices).all();

  return JSON.stringify(
    {
      services: allServices,
      incidents: allIncidents,
      incidentUpdates: allUpdates,
      incidentServices: allIncidentServices,
      maintenance: allMaintenance,
      maintenanceServices: allMaintenanceServices,
    },
    null,
    2
  );
}

export async function importData(jsonStr: string) {
  try {
    const data = JSON.parse(jsonStr);

    if (data.services) {
      for (const s of data.services) {
        db.insert(services)
          .values({
            name: s.name,
            description: s.description,
            status: s.status,
            displayOrder: s.display_order ?? s.displayOrder ?? 0,
            visible: s.visible ?? true,
          })
          .run();
      }
    }

    if (data.incidents) {
      for (const inc of data.incidents) {
        db.insert(incidents)
          .values({
            title: inc.title,
            status: inc.status,
            impact: inc.impact,
            startedAt: inc.started_at ?? inc.startedAt,
            resolvedAt: inc.resolved_at ?? inc.resolvedAt,
          })
          .run();
      }
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { message: "Data imported successfully" };
  } catch (e) {
    return { error: "Invalid JSON data" };
  }
}
