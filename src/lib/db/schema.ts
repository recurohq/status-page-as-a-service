import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["operational", "degraded", "partial_outage", "major_outage", "maintenance"],
  })
    .notNull()
    .default("operational"),
  displayOrder: integer("display_order").notNull().default(0),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const incidents = sqliteTable("incidents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  status: text("status", {
    enum: ["investigating", "identified", "monitoring", "resolved"],
  })
    .notNull()
    .default("investigating"),
  impact: text("impact", {
    enum: ["none", "minor", "major", "critical"],
  })
    .notNull()
    .default("none"),
  startedAt: text("started_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  resolvedAt: text("resolved_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const incidentUpdates = sqliteTable("incident_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  incidentId: integer("incident_id")
    .notNull()
    .references(() => incidents.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const incidentServices = sqliteTable(
  "incident_services",
  {
    incidentId: integer("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.incidentId, table.serviceId] })]
);

export const maintenance = sqliteTable("maintenance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  scheduledStart: text("scheduled_start").notNull(),
  scheduledEnd: text("scheduled_end").notNull(),
  status: text("status", {
    enum: ["scheduled", "in_progress", "completed"],
  })
    .notNull()
    .default("scheduled"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const maintenanceServices = sqliteTable(
  "maintenance_services",
  {
    maintenanceId: integer("maintenance_id")
      .notNull()
      .references(() => maintenance.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.maintenanceId, table.serviceId] })]
);

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  token: text("token").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Service = typeof services.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type IncidentUpdate = typeof incidentUpdates.$inferSelect;
export type Maintenance = typeof maintenance.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
