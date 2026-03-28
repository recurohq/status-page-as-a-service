import { Card, CardContent } from "@/components/ui/card";
import { getServices } from "@/actions/services";
import { getActiveIncidents } from "@/actions/incidents";
import { getSubscribers } from "@/actions/subscribers";
import { getUpcomingMaintenance } from "@/actions/maintenance";
import { Server, AlertTriangle, Users, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

const STAT_STYLES = [
  { icon: Server, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { icon: AlertTriangle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
  { icon: Users, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { icon: Wrench, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
];

export default async function AdminOverview() {
  const [services, activeIncidents, subs, upcoming] = await Promise.all([
    getServices(),
    getActiveIncidents(),
    getSubscribers(),
    getUpcomingMaintenance(),
  ]);

  const stats = [
    { label: "Services", value: services.length },
    { label: "Active Incidents", value: activeIncidents.length },
    { label: "Subscribers", value: subs.length },
    { label: "Maintenance", value: upcoming.length },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const style = STAT_STYLES[i];
          const Icon = style.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
