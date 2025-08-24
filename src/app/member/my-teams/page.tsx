"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";

const mockTeams = [
  { id: 1, name: "Frontend Team", role: "MEMBER", members: 5 },
  { id: 2, name: "QA Team", role: "MEMBER", members: 3 },
];

export default function MyTeams() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Teams</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {mockTeams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{team.name}</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4" /> Role: {team.role}
              </p>
              <p className="text-sm text-gray-600">Members: {team.members}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
