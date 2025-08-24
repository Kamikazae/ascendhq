import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/circular-progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function TeamPage({ params }: Props) {
  const session = await getServerSession();

  if (!session) {
    return <p className="p-4">You must be signed in to view this team.</p>;
  }

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { user: true } },
      objectives: { include: { keyResults: true } },
    },
  });

  if (!team) {
    return <p className="p-4">Team not found.</p>;
  }

  // Calculate completion for each objective
  const objectivesWithCompletion = team.objectives.map((obj) => {
    const total = obj.keyResults.length;
    const completed = obj.keyResults.filter((kr) => kr.progress === 100).length;
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...obj, completion };
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
      {/* Team Header */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl">{team.name}</CardTitle>
            <p className="text-muted-foreground">
              {team.members.length} members • {team.objectives.length} objectives
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/teams/${team.id}/new-objective`}>
              <Button>Add Objective</Button>
            </Link>
            <Link href={`/teams/${team.id}/add-member`}>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add Member
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Objectives Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Objectives</h2>
        {objectivesWithCompletion.length === 0 ? (
          <p className="text-gray-600">No objectives yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {objectivesWithCompletion.map((obj) => (
              <Card key={obj.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <CircularProgress
                    value={obj.completion}
                    size={80}
                    strokeWidth={8}
                  />
                  <h3 className="mt-4 text-lg font-semibold">{obj.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {obj.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {obj.keyResults.length} Key Results
                  </p>
                  <Link
                    href={`/objectives/${obj.id}`}
                    className="mt-4 text-primary hover:underline text-sm"
                  >
                    View Details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Team Members Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.members.map((m) => (
            <Card
              key={m.id}
              className="flex items-center justify-between p-4 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {m.user.name?.charAt(0) || m.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{m.user.name || m.user.email}</p>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
