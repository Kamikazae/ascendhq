"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Target, Users } from "lucide-react";

export default function MemberDashboard() {
  const mockStats = {
    objectives: 4,
    completed: 2,
    teams: 2,
    progress: 65,
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Member Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Objectives</CardTitle>
            <Target className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{mockStats.objectives}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Completed</CardTitle>
            <Activity className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{mockStats.completed}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Teams</CardTitle>
            <Users className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{mockStats.teams}</CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={mockStats.progress} className="h-3" />
          <p className="mt-2 text-sm text-gray-600">{mockStats.progress}% complete</p>
        </CardContent>
      </Card>
    </div>
  );
}
