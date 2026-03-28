import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, timezone?: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  if (timezone) opts.timeZone = timezone;
  return new Date(dateStr).toLocaleDateString("en-US", opts);
}

export function formatDateTime(dateStr: string, timezone?: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  if (timezone) opts.timeZone = timezone;
  return new Date(dateStr).toLocaleString("en-US", opts);
}

export function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

// --- Status types ---

export type ServiceStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
export type IncidentImpact = "none" | "minor" | "major" | "critical";
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed";

// --- Label maps ---

export const STATUS_LABELS: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  maintenance: "Under Maintenance",
};

export const IMPACT_LABELS: Record<string, string> = {
  none: "None",
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
};

// --- Badge variant maps ---

export const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "orange" | "danger" | "info"> = {
  operational: "success",
  degraded: "warning",
  partial_outage: "orange",
  major_outage: "danger",
  maintenance: "info",
};

export const IMPACT_BADGE_VARIANT: Record<string, "secondary" | "warning" | "orange" | "danger"> = {
  none: "secondary",
  minor: "warning",
  major: "orange",
  critical: "danger",
};

export const MAINTENANCE_BADGE_VARIANT: Record<string, "info" | "warning" | "success"> = {
  scheduled: "info",
  in_progress: "warning",
  completed: "success",
};

// --- Priority map for uptime calculation ---

export const IMPACT_PRIORITY: Record<string, number> = {
  critical: 3,
  major: 2,
  minor: 1,
  none: 0,
};

// --- Shared types ---

export type DayData = { date: string; impact: string | null };

// --- Shared env helpers ---

export function getSiteName(): string {
  return process.env.SITE_NAME || "Status Page";
}

export function getBaseUrl(): string {
  return process.env.BASE_URL || "http://localhost:3000";
}

// --- Settings keys ---

export const SETTING_KEYS = [
  "site_name",
  "site_description",
  "logo_url",
  "timezone",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_from",
] as const;

// --- Client-side download helper ---

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Impact to service status mapping ---

export function impactToServiceStatus(impact: IncidentImpact): ServiceStatus {
  switch (impact) {
    case "critical": return "major_outage";
    case "major": return "partial_outage";
    case "minor": return "degraded";
    default: return "operational";
  }
}
