"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type Objective = {
  id: string;
  title: string;
  status: string;
  keyResults: number;
  progress: number;
};

export default function ManagerObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/manager/objectives");
      if (res.ok) {
        const data = await res.json();
        setObjectives(data);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-muted rounded-xl p-6">
        <h1 className="text-2xl font-bold">Manage Objectives</h1>
        <p className="text-muted-foreground">
          View and track your team’s objectives and their key results.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {objectives.map((obj) => (
          <Card key={obj.id}>
            <CardHeader>
              <CardTitle>{obj.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">Key Results: {obj.keyResults}</p>
              <p
                className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                  obj.status === "ON_TRACK"
                    ? "bg-green-100 text-green-800"
                    : obj.status === "AT_RISK"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {obj.status.replace("_", " ")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Progress: {obj.progress}%
              </p>
              <Link
                href={`/manager/objectives/${obj.id}`}
                className="mt-2 inline-block text-primary hover:underline text-sm"
              >
                View Details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
