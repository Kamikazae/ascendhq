import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/circular-progress"; //

interface Props {
  params: { id: string };
}

export default async function TeamPage({ params }: Props) {
  const session = await getServerSession(authOptions);

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
    const completed = obj.keyResults.filter((kr) => kr.status === "Completed").length;
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...obj, completion };
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Team Header */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground">
              {team.members.length} members • {team.objectives.length} objectives
            </p>
          </div>
          <Link href={`/teams/${team.id}/new-objective`} className="mt-4 sm:mt-0">
            <Button>Add Objective</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Objectives */}
      {objectivesWithCompletion.length === 0 ? (
        <p className="text-gray-600">No objectives yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {objectivesWithCompletion.map((obj) => (
            <Card key={obj.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <CircularProgress value={obj.completion} size={80} strokeWidth={8} />
                <h3 className="mt-4 text-lg font-semibold">{obj.title}</h3>
                <p className="text-sm text-muted-foreground">{obj.description}</p>
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

      {/* Team Members */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Team Members</h2>
        <ul className="space-y-1">
          {team.members.map((m) => (
            <li key={m.id}>
              {m.user.name || m.user.email} — {m.role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
