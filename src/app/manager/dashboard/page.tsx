"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CircularProgress } from "@/components/circular-progress";

type DashboardData = {
  teamName: string;
  completion: number;
  objectives: { id: string; title: string; status: string }[];
  recentUpdates: { id: string; member: string; comment: string; date: string }[];
};

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/manager/dashboard");
        console.log("Response status:", res.status); // 👈 add logging
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        console.log("Fetched data:", json); // 👈 check data
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);


  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">Error: {error}</p>;
  }

  if (!data) {
    return <p className="p-6">No data available.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="bg-muted rounded-xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your team’s progress and updates.
          </p>
        </div>
        <Link href="/manager/objectives">
          <Button>View Objectives</Button>
        </Link>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{data.teamName} Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <CircularProgress value={data.completion} size={100} strokeWidth={8} />
          <div>
            <p className="text-lg font-semibold">
              {data.completion}% Completed
            </p>
            <p className="text-muted-foreground">
              Based on all objectives and key results.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Objectives Status */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.objectives.map((obj) => (
          <Card key={obj.id}>
            <CardHeader>
              <CardTitle>{obj.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${obj.status === "ON_TRACK"
                  ? "bg-green-100 text-green-800"
                  : obj.status === "AT_RISK"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {obj.status.replace("_", " ")}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Progress Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.recentUpdates.map((update) => (
            <div key={update.id} className="border-b pb-2">
              <p className="font-medium">{update.member}</p>
              <p className="text-sm text-muted-foreground">{update.comment}</p>
              <span className="text-xs text-muted-foreground">
                {new Date(update.date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
