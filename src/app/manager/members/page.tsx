"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ManagerMembersPage() {
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        async function fetchMembers() {
            try {
                const res = await fetch("/api/manager/members");
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data);
                    console.log("Fetched members:", data);
                } else {
                    console.error("Failed to fetch members:", res.status);
                }
            } catch (err) {
                console.error("Error fetching members:", err);
            }
        }

        fetchMembers();
    }, []);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="bg-muted rounded-xl p-6">
                <h1 className="text-2xl font-bold">Manage Members</h1>
                <p className="text-muted-foreground">
                    View your team members and their contributions.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {members.map((member) => (
                    <Card key={member.id}>
                        <CardHeader className="flex items-center gap-4">
                            <Avatar>
                                <AvatarFallback>{member.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{member.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {member.role}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-semibold">Contributions:</p>
                            {member.contributions?.length > 0 ? (
                                <ul className="list-disc pl-4 text-sm">
                                    {member.contributions.map((c: any) => (
                                        <li key={c.id}>
                                            {c.keyResultTitle} – Progress: {c.newValue}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No contributions yet</p>
                            )}
                        </CardContent>

                    </Card>
                ))}
            </div>
        </div>
    );
}
