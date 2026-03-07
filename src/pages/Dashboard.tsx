import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox, Users, Stethoscope, FlaskConical } from "lucide-react";
import { getDashboardCounts } from "@/services/admin/dashboardService";
import { toApiError } from "@/services/api/errors";
import type { DashboardCounts } from "@/services/admin/types";

const statsConfig = [
  {
    key: "new_requests" as const,
    label: "New Requests",
    icon: Inbox,
  },
  {
    key: "patients_count" as const,
    label: "Patients",
    icon: Users,
  },
  {
    key: "doctors_count" as const,
    label: "Doctors",
    icon: Stethoscope,
  },
  {
    key: "labs_count" as const,
    label: "Labs",
    icon: FlaskConical,
  },
];

const defaultCounts: DashboardCounts = {
  new_requests: 0,
  patients_count: 0,
  doctors_count: 0,
  labs_count: 0,
};

export default function Dashboard() {
  const [counts, setCounts] = useState<DashboardCounts>(defaultCounts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardCounts();
      setCounts(data);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCounts();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Admin summary across requests and users</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard counts...
        </div>
      )}

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadCounts()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.key} className="stat-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{counts[stat.key] ?? 0}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
