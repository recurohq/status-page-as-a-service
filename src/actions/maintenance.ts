"use server";

import { db } from "@/lib/db";
import { maintenance, maintenanceServices, services } from "@/lib/db/schema";
import { eq, desc, ne, gte, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notifyMaintenanceScheduled } from "@/lib/notifications/email";
import type { MaintenanceStatus, ServiceStatus } from "@/lib/utils";

export async function getMaintenanceList() {
  return db
    .select()
    .from(maintenance)
    .orderBy(desc(maintenance.scheduledStart))
    .all();
}

export async function getUpcomingMaintenance() {
  const now = new Date().toISOString();
  return db
    .select()
    .from(maintenance)
    .where(
      and(
        ne(maintenance.status, "completed"),
        or(
          gte(maintenance.scheduledEnd, now),
          eq(maintenance.status, "in_progress")
        )
      )
    )
    .orderBy(maintenance.scheduledStart)
    .all();
}

export async function getMaintenance(id: number) {
  return db.select().from(maintenance).where(eq(maintenance.id, id)).get();
}

export async function getMaintenanceServices(maintenanceId: number) {
  return db
    .select({
      serviceId: maintenanceServices.serviceId,
      serviceName: services.name,
    })
    .from(maintenanceServices)
    .innerJoin(services, eq(maintenanceServices.serviceId, services.id))
    .where(eq(maintenanceServices.maintenanceId, maintenanceId))
    .all();
}

export async function createMaintenance(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const scheduledStart = formData.get("scheduledStart") as string;
  const scheduledEnd = formData.get("scheduledEnd") as string;
  const serviceIds = formData.getAll("serviceIds").map(Number);

  const result = db
    .insert(maintenance)
    .values({ title, description, scheduledStart, scheduledEnd })
    .returning()
    .get();

  for (const serviceId of serviceIds) {
    db.insert(maintenanceServices)
      .values({ maintenanceId: result.id, serviceId })
      .run();
  }

  revalidatePath("/admin/maintenance");
  revalidatePath("/");

  notifyMaintenanceScheduled(title, scheduledStart, scheduledEnd).catch(
    console.error
  );
}

function setLinkedServicesStatus(maintenanceId: number, status: ServiceStatus) {
  const linked = db
    .select({ serviceId: maintenanceServices.serviceId })
    .from(maintenanceServices)
    .where(eq(maintenanceServices.maintenanceId, maintenanceId))
    .all();

  for (const s of linked) {
    db.update(services)
      .set({ status })
      .where(eq(services.id, s.serviceId))
      .run();
  }
}

export async function updateMaintenanceStatus(id: number, status: MaintenanceStatus) {
  db.update(maintenance).set({ status }).where(eq(maintenance.id, id)).run();

  if (status === "in_progress") {
    setLinkedServicesStatus(id, "maintenance");
  } else if (status === "completed") {
    setLinkedServicesStatus(id, "operational");
  }

  revalidatePath("/admin/maintenance");
  revalidatePath("/");
}

export async function deleteMaintenance(id: number) {
  db.delete(maintenance).where(eq(maintenance.id, id)).run();
  revalidatePath("/admin/maintenance");
  revalidatePath("/");
}
