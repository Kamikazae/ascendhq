"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CircularProgress } from "@/components/circular-progress"; 
import DashboardOverview from "@/components/DashboardOverview";
// Mock data for now
const mockTeams = [
  {
    id: "1",
    name: "Product Team",
    members: 8,
    objectives: 5,
    completion: 70,
  },
  {
    id: "2",
    name: "Marketing Team",
    members: 5,
    objectives: 3,
    completion: 40,
  },
  {
    id: "3",
    name: "Engineering",
    members: 12,
    objectives: 10,
    completion: 85,
  },
];

export default function DashboardPage() {
  const user = { name: "John Doe" };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="bg-muted rounded-xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            Here’s an overview of your teams and their progress.
          </p>
        </div>
        <Link href="/teams/new">
          <Button>Create Team</Button>
        </Link>
      </div>
      {/* Overview Section */
      <DashboardOverview />}
      {/* Teams Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockTeams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <CircularProgress value={team.completion} size={80} strokeWidth={8} />
              <h3 className="mt-4 text-lg font-semibold">{team.name}</h3>
              <p className="text-sm text-muted-foreground">
                {team.members} members • {team.objectives} objectives
              </p>
              <Link
                href={`/teams/${team.id}`}
                className="mt-4 text-primary hover:underline text-sm"
              >
                View Team
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
