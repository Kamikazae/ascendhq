"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Search } from "lucide-react";

// Mock member data
const mockMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Manager",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Lee",
    email: "sarah@example.com",
    role: "Member",
    status: "Pending",
  },
  {
    id: 3,
    name: "Michael Smith",
    email: "michael@example.com",
    role: "Member",
    status: "Active",
  },
];

export default function ManageMembersPage() {
  const [search, setSearch] = useState("");

  const filteredMembers = mockMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Members</h1>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    member.status === "Active" ? "default" : "secondary"
                  }
                >
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
