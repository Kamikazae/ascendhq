"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CircularProgress } from "@/components/circular-progress";
import DashboardOverview from "@/components/DashboardOverview";

export default function DashboardPage() {
  const [data, setData] = useState<{ overview: any; teams: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const user = { name: "John Doe" };

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      console.log("Dashboard data:", json);
      setData(json);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!data) return <p className="p-4">Failed to load dashboard</p>;

  return (
    <>
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
      {/* Overview Section */}
      <DashboardOverview  />
    </>
  );
}
