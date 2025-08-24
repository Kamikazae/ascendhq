"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/circular-progress";

interface Member {
  id: string;
  name: string;
}

interface Objective {
  id: string;
  title: string;
  status: string;
  completion: number;
  teamName: string;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
  objectives: Objective[]; // might be empty from API
}

interface DashboardData {
  teams: Team[];
  objectives: Objective[];
}

export default function TeamsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json: DashboardData = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Loading teams...</div>;
  }

  if (!data || data.teams.length === 0) {
    return <div className="p-6">No teams found.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
      {data.teams.map((team) => {
        // Get all objectives for this team from objectives array
        const teamObjectives = data.objectives.filter(
          (obj) => obj.teamName === team.name
        );

        // Calculate average completion %
        const completion =
          teamObjectives.length > 0
            ? Math.round(
                teamObjectives.reduce(
                  (sum, obj) => sum + (obj.completion || 0),
                  0
                ) / teamObjectives.length
              )
            : 0;

        return (
          <Card
            key={team.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6 flex flex-col items-center">
              <CircularProgress value={completion} size={80} strokeWidth={8} />
              <h3 className="mt-4 text-lg font-semibold">{team.name}</h3>
              <p className="text-sm text-muted-foreground">
                {team.members.length} members •{" "}
                {teamObjectives.length > 0
                  ? `${teamObjectives[0].title} (${teamObjectives[0].status})`
                  : "No objectives"}
              </p>

              <Link
                href={`/admin/teams/${team.id}`}
                className="mt-4 text-primary hover:underline text-sm"
              >
                View Team
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
