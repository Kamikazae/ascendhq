
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockObjectives = [
  { id: 1, title: "Improve Documentation", progress: 80, status: "ON_TRACK" },
  { id: 2, title: "Increase Test Coverage", progress: 50, status: "AT_RISK" },
  { id: 3, title: "Refactor Auth System", progress: 20, status: "OFF_TRACK" },
];

export default function MyObjectives() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Objectives</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {mockObjectives.map((obj) => (
          <Card key={obj.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>{obj.title}</CardTitle>
              <Badge
                variant={
                  obj.status === "ON_TRACK"
                    ? "default"
                    : obj.status === "AT_RISK"
                    ? "secondary"
                    : "destructive"
                }
              >
                {obj.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <Progress value={obj.progress} className="h-3" />
              <p className="mt-2 text-sm text-gray-600">{obj.progress}% complete</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
