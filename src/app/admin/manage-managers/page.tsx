"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  UserCog,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Building2,
  Users,
  TrendingUp,
  Crown,
  Shield,
  MoreHorizontal,
  AlertCircle
} from "lucide-react";

// TypeScript interfaces
interface Manager {
  id: number;
  name: string;
  email: string;
  team: string;
  role: string;
  status: "Active" | "Inactive";
  teamMembers?: number;
  objectives?: number;
  lastActive?: string;
  joinedDate?: string;
}

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to generate avatar color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Enhanced manager card component
function ManagerCard({ manager, index }: { manager: Manager; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className={`h-12 w-12 ${getAvatarColor(manager.name)} text-white border-2 border-white shadow-md`}>
                <AvatarFallback className="font-medium text-white">
                  {getInitials(manager.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                  {manager.name}
                  <Crown className="h-4 w-4 text-yellow-500" />
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{manager.email}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={manager.status === "Active" ? "default" : "secondary"}>
                {manager.status}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Team Information */}
          <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
            <Building2 className="h-4 w-4 text-purple-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{manager.team}</p>
              <p className="text-xs text-muted-foreground">Team Assignment</p>
            </div>
          </div>

          {/* Manager Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Team Size</p>
                <p className="text-lg font-bold text-blue-600">{manager.teamMembers || 8}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Objectives</p>
                <p className="text-lg font-bold text-green-600">{manager.objectives || 5}</p>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
              <Shield className="h-3 w-3" />
              {manager.role}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ManageManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchManagers() {
      try {
        const res = await fetch("/api/admin/manage-managers");
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          } else if (res.status === 403) {
            throw new Error("Access denied. Administrator permissions required.");
          } else if (res.status === 503) {
            throw new Error("Service temporarily unavailable. Please try again later.");
          } else {
            throw new Error("Failed to load manager data.");
          }
        }

        const data = await res.json();
        console.log("Raw API response:", data);

        // Transform API data to match frontend interface
        const transformedManagers: Manager[] = data.map((manager: {
          id: string | number;
          name: string;
          email: string;
          team: string;
          role: string;
          status: string;
          teamMembers: number;
          objectives: number;
          lastActive: string;
          joinedDate: string;
        }) => ({
          id: parseInt(manager.id.toString()) || 0,
          name: manager.name,
          email: manager.email,
          team: manager.team,
          role: manager.role,
          status: manager.status as "Active" | "Inactive",
          teamMembers: manager.teamMembers,
          objectives: manager.objectives,
          lastActive: manager.lastActive,
          joinedDate: manager.joinedDate
        }));
        console.log("Transformed managers:", transformedManagers);
        setManagers(transformedManagers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchManagers();
  }, []);

  // Filter managers based on search
  const filteredManagers = useMemo(() => {
    console.log("Filtering managers. Search term:", search);
    console.log("Total managers before filter:", managers.length);

    const filtered = managers.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.team.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase())
    );

    console.log("Filtered managers count:", filtered.length);
    return filtered;
  }, [managers, search]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalManagers = managers.length;
    const activeManagers = managers.filter(m => m.status === "Active").length;
    const totalTeamMembers = managers.reduce((sum, m) => sum + (m.teamMembers || 0), 0);
    const totalObjectives = managers.reduce((sum, m) => sum + (m.objectives || 0), 0);

    return { totalManagers, activeManagers, totalTeamMembers, totalObjectives };
  }, [managers]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCog className="h-8 w-8 text-purple-600" />
            Manage Managers
          </h1>
        </motion.div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg text-red-600 mb-2">Error loading managers</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCog className="h-8 w-8 text-purple-600" />
          Manage Managers
        </h1>
        <p className="text-muted-foreground text-lg">
          Oversee and manage your team leaders and their performance
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Managers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalManagers}</p>
              </div>
              <UserCog className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Managers</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeManagers}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTeamMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Objectives</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalObjectives}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search managers by name, email, team, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button className="ml-4 gap-2">
          <Plus className="h-4 w-4" />
          Add Manager
        </Button>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">
          Showing {filteredManagers.length} of {managers.length} managers
        </p>
      </motion.div>

      {/* Managers Grid */}
      {filteredManagers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredManagers.map((manager, index) => (
            <ManagerCard key={manager.id} manager={manager} index={index} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 mb-2">No managers found</p>
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}