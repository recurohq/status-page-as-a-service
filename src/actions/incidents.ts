"use server";

import { db } from "@/lib/db";
import {
  incidents,
  incidentUpdates,
  incidentServices,
  services,
} from "@/lib/db/schema";
import { eq, desc, and, gte, lte, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  notifyIncidentCreated,
  notifyIncidentUpdated,
  notifyIncidentResolved,
} from "@/lib/notifications/email";
import {
  type IncidentImpact,
  type IncidentStatus,
  type DayData,
  impactToServiceStatus,
  IMPACT_PRIORITY,
} from "@/lib/utils";

export async function getIncidents() {
  return db.select().from(incidents).orderBy(desc(incidents.createdAt)).all();
}

export async function getActiveIncidents() {
  return db
    .select()
    .from(incidents)
    .where(ne(incidents.status, "resolved"))
    .orderBy(desc(incidents.createdAt))
    .all();
}

export async function getIncident(id: number) {
  return db.select().from(incidents).where(eq(incidents.id, id)).get();
}

export async function getIncidentUpdates(incidentId: number) {
  return db
    .select()
    .from(incidentUpdates)
    .where(eq(incidentUpdates.incidentId, incidentId))
    .orderBy(desc(incidentUpdates.createdAt))
    .all();
}

export async function getIncidentServices(incidentId: number) {
  return db
    .select({ serviceId: incidentServices.serviceId, serviceName: services.name })
    .from(incidentServices)
    .innerJoin(services, eq(incidentServices.serviceId, services.id))
    .where(eq(incidentServices.incidentId, incidentId))
    .all();
}

export async function createIncident(formData: FormData) {
  const title = formData.get("title") as string;
  const impact = formData.get("impact") as IncidentImpact;
  const status = formData.get("status") as IncidentStatus;
  const message = formData.get("message") as string;
  const serviceIds = formData.getAll("serviceIds").map(Number);

  const result = db
    .insert(incidents)
    .values({ title, impact, status })
    .returning()
    .get();

  if (message) {
    db.insert(incidentUpdates)
      .values({ incidentId: result.id, status, message })
      .run();
  }

  const serviceStatus = impactToServiceStatus(impact);
  for (const serviceId of serviceIds) {
    db.insert(incidentServices)
      .values({ incidentId: result.id, serviceId })
      .run();

    if (serviceStatus !== "operational") {
      db.update(services)
        .set({ status: serviceStatus })
        .where(eq(services.id, serviceId))
        .run();
    }
  }

  revalidatePath("/admin/incidents");
  revalidatePath("/");

  notifyIncidentCreated(title, impact, message || "").catch(console.error);

  return result.id;
}

export async function postIncidentUpdate(
  incidentId: number,
  formData: FormData
) {
  const status = formData.get("status") as IncidentStatus;
  const message = formData.get("message") as string;

  db.insert(incidentUpdates)
    .values({ incidentId, status, message })
    .run();

  // Merge status + resolvedAt into a single update when resolving
  if (status === "resolved") {
    db.update(incidents)
      .set({ status, resolvedAt: new Date().toISOString() })
      .where(eq(incidents.id, incidentId))
      .run();

    const affectedServices = db
      .select({ serviceId: incidentServices.serviceId })
      .from(incidentServices)
      .where(eq(incidentServices.incidentId, incidentId))
      .all();

    for (const s of affectedServices) {
      db.update(services)
        .set({ status: "operational" })
        .where(eq(services.id, s.serviceId))
        .run();
    }
  } else {
    db.update(incidents)
      .set({ status })
      .where(eq(incidents.id, incidentId))
      .run();
  }

  const incident = db
    .select()
    .from(incidents)
    .where(eq(incidents.id, incidentId))
    .get();

  if (incident) {
    if (status === "resolved") {
      notifyIncidentResolved(incident.title).catch(console.error);
    } else {
      notifyIncidentUpdated(incident.title, status, message).catch(console.error);
    }
  }

  revalidatePath("/admin/incidents");
  revalidatePath(`/admin/incidents/${incidentId}`);
  revalidatePath("/");
}

export async function getRecentIncidents(days: number = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db
    .select()
    .from(incidents)
    .where(
      and(
        eq(incidents.status, "resolved"),
        gte(incidents.resolvedAt, since.toISOString())
      )
    )
    .orderBy(desc(incidents.resolvedAt))
    .all();
}

export async function getUptimeData(serviceId: number): Promise<DayData[]> {
  const days = 90;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (days - 1));
  const windowStart = startDate.toISOString().split("T")[0] + "T00:00:00.000Z";
  const windowEnd = now.toISOString().split("T")[0] + "T23:59:59.999Z";

  // Single query: fetch all incidents for this service within the 90-day window
  const allIncidents = db
    .select({
      impact: incidents.impact,
      startedAt: incidents.startedAt,
      resolvedAt: incidents.resolvedAt,
    })
    .from(incidents)
    .innerJoin(incidentServices, eq(incidents.id, incidentServices.incidentId))
    .where(
      and(
        eq(incidentServices.serviceId, serviceId),
        lte(incidents.startedAt, windowEnd),
        sql`(${incidents.resolvedAt} IS NULL OR ${incidents.resolvedAt} >= ${windowStart})`
      )
    )
    .all();

  // Bucket by day in application code
  const result: DayData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayStart = `${dateStr}T00:00:00.000Z`;
    const dayEnd = `${dateStr}T23:59:59.999Z`;

    let worstImpact: string | null = null;
    let worstPriority = -1;

    for (const inc of allIncidents) {
      if (inc.startedAt <= dayEnd && (inc.resolvedAt === null || inc.resolvedAt >= dayStart)) {
        const p = IMPACT_PRIORITY[inc.impact] ?? 0;
        if (p > worstPriority) {
          worstPriority = p;
          worstImpact = inc.impact;
        }
      }
    }

    result.push({ date: dateStr, impact: worstImpact });
  }

  return result;
}
