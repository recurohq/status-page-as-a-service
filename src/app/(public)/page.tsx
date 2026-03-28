import { StatusBanner } from "@/components/public/status-banner";
import { ServiceRow } from "@/components/public/service-row";
import { IncidentCard } from "@/components/public/incident-card";
import { MaintenanceCard } from "@/components/public/maintenance-card";
import { getVisibleServices } from "@/actions/services";
import {
  getActiveIncidents,
  getIncidentUpdates,
  getIncidentServices,
  getRecentIncidents,
  getUptimeData,
} from "@/actions/incidents";
import {
  getUpcomingMaintenance,
  getMaintenanceServices,
} from "@/actions/maintenance";
import { getSetting } from "@/actions/settings";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const [services, activeIncidents, upcomingMaintenance, recentIncidents, timezone] =
    await Promise.all([
      getVisibleServices(),
      getActiveIncidents(),
      getUpcomingMaintenance(),
      getRecentIncidents(14),
      getSetting("timezone"),
    ]);

  const tz = timezone || undefined;

  const serviceUptimeData = await Promise.all(
    services.map(async (s) => ({
      serviceId: s.id,
      data: await getUptimeData(s.id),
    }))
  );

  const activeIncidentDetails = await Promise.all(
    activeIncidents.map(async (inc) => ({
      incident: inc,
      updates: await getIncidentUpdates(inc.id),
      services: await getIncidentServices(inc.id),
    }))
  );

  const maintenanceDetails = await Promise.all(
    upcomingMaintenance.map(async (m) => ({
      item: m,
      services: await getMaintenanceServices(m.id),
    }))
  );

  const recentIncidentDetails = await Promise.all(
    recentIncidents.map(async (inc) => ({
      incident: inc,
      updates: await getIncidentUpdates(inc.id),
      services: await getIncidentServices(inc.id),
    }))
  );

  const groupedByDate: Record<string, typeof recentIncidentDetails> = {};
  for (const item of recentIncidentDetails) {
    const date = item.incident.resolvedAt
      ? item.incident.resolvedAt.split("T")[0]
      : item.incident.createdAt.split("T")[0];
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(item);
  }

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-10">
      <StatusBanner services={services} />

      {services.length > 0 && (
        <section className="space-y-2">
          {services.map((service) => {
            const uptime =
              serviceUptimeData.find((u) => u.serviceId === service.id)
                ?.data ?? [];
            return (
              <ServiceRow
                key={service.id}
                service={service}
                uptimeData={uptime}
                timezone={tz}
              />
            );
          })}
        </section>
      )}

      {activeIncidentDetails.length > 0 && (
        <section>
          <SectionHeading>Active Incidents</SectionHeading>
          <div className="space-y-3">
            {activeIncidentDetails.map(({ incident, updates, services }) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                updates={updates}
                affectedServices={services}
                timezone={tz}
              />
            ))}
          </div>
        </section>
      )}

      {maintenanceDetails.length > 0 && (
        <section>
          <SectionHeading>Scheduled Maintenance</SectionHeading>
          <div className="space-y-3">
            {maintenanceDetails.map(({ item, services }) => (
              <MaintenanceCard
                key={item.id}
                item={item}
                affectedServices={services}
                timezone={tz}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading>Past Incidents</SectionHeading>
        {sortedDates.length === 0 ? (
          <p className="text-[13px] text-muted-foreground py-4">
            No incidents reported in the last 14 days.
          </p>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="text-[13px] font-medium text-muted-foreground mb-3">
                  {formatDate(date, tz)}
                </h3>
                <div className="space-y-3">
                  {groupedByDate[date].map(
                    ({ incident, updates, services }) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        updates={updates}
                        affectedServices={services}
                        timezone={tz}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
      {children}
    </h2>
  );
}
