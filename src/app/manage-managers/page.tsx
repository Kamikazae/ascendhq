'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ManageManagers() {
    const [search, setSearch] = useState("");

    const managers = [
        { id: 1, name: "Sarah Johnson", email: "sarah@company.com", team: "Team Alpha", role: "Manager" },
        { id: 2, name: "David Kim", email: "david@company.com", team: "Team Beta", role: "Manager" },
        { id: 3, name: "Emily Carter", email: "emily@company.com", team: "Team Gamma", role: "Manager" },
    ];

    const filteredManagers = managers.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.team.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Manage Managers</h2>
                    <Button>Add Manager</Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-4">
                        <Input
                            placeholder="Search managers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Team</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredManagers.map((manager) => (
                                <tr key={manager.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{manager.name}</td>
                                    <td className="p-3">{manager.email}</td>
                                    <td className="p-3">{manager.team}</td>
                                    <td className="p-3">{manager.role}</td>
                                    <td className="p-3 flex gap-2">
                                        <Button variant="outline" size="sm">View</Button>
                                        <Button variant="outline" size="sm">Edit</Button>
                                        <Button variant="destructive" size="sm">Remove</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
