"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
    Building2,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Users,
    Target,
    TrendingUp,
    Crown,
    MoreHorizontal,
    AlertCircle,
    UserPlus
} from "lucide-react";

// TypeScript interfaces
interface Team {
    id: string;
    name: string;
    memberCount: number;
    managerName: string;
    managerId?: string;
    objectiveCount: number;
    averageProgress: number;
    status: "On Track" | "At Risk" | "Off Track";
    members: Array<{
        id: string;
        name: string;
        role: string;
    }>;
    createdDate: string;
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

// Status configuration
const statusConfig = {
    "On Track": {
        variant: "default" as const,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
    },
    "At Risk": {
        variant: "secondary" as const,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
    },
    "Off Track": {
        variant: "destructive" as const,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
    }
};

// Enhanced team card component
function TeamCard({ team, index }: { team: Team; index: number }) {
    const statusConf = statusConfig[team.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${statusConf.borderColor} ${statusConf.bgColor}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className={`h-12 w-12 ${getAvatarColor(team.name)} text-white border-2 border-white shadow-md`}>
                                <AvatarFallback className="font-medium text-white">
                                    {getInitials(team.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                                    {team.name}
                                    <Building2 className="h-4 w-4 text-blue-500" />
                                </CardTitle>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Crown className="h-3 w-3" />
                                    <span className="truncate">Manager: {team.managerName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={statusConf.variant} className={statusConf.bgColor}>
                                {team.status}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Team Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Members</p>
                                <p className="text-lg font-bold text-blue-600">{team.memberCount}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
                            <Target className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Objectives</p>
                                <p className="text-lg font-bold text-purple-600">{team.objectiveCount}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Progress</p>
                                <p className="text-lg font-bold text-green-600">{team.averageProgress}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Team Members Preview */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Team Members</p>
                        <div className="flex -space-x-2">
                            {team.members.slice(0, 5).map((member) => (
                                <Avatar key={member.id} className={`h-8 w-8 border-2 border-white ${getAvatarColor(member.name)}`}>
                                    <AvatarFallback className="text-xs text-white">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {team.members.length > 5 && (
                                <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                    <span className="text-xs text-gray-600">+{team.members.length - 5}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Created {new Date(team.createdDate).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                            <Eye className="h-4 w-4" />
                            View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Member
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ManageTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        async function fetchTeams() {
            try {
                const res = await fetch("/api/admin/manage-teams");
                if (!res.ok) {
                    if (res.status === 401) {
                        throw new Error("Authentication required. Please sign in.");
                    } else if (res.status === 403) {
                        throw new Error("Admin access required.");
                    } else {
                        throw new Error("Failed to load teams data.");
                    }
                }
                const data = await res.json();
                setTeams(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchTeams();
    }, []);

    // Filter teams based on search and status
    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) ||
                team.managerName.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === "all" || team.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [teams, search, statusFilter]);

    // Calculate summary stats
    const stats = useMemo(() => {
        const totalTeams = teams.length;
        const onTrackTeams = teams.filter(t => t.status === "On Track").length;
        const atRiskTeams = teams.filter(t => t.status === "At Risk").length;
        const offTrackTeams = teams.filter(t => t.status === "Off Track").length;
        const totalMembers = teams.reduce((sum, t) => sum + t.memberCount, 0);
        const totalObjectives = teams.reduce((sum, t) => sum + t.objectiveCount, 0);

        return { totalTeams, onTrackTeams, atRiskTeams, offTrackTeams, totalMembers, totalObjectives };
    }, [teams]);

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
                                <div className="h-40 bg-gray-200 rounded" />
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
                        <Building2 className="h-8 w-8 text-blue-600" />
                        Manage Teams
                    </h1>
                </motion.div>

                <Card className="border-red-200 bg-red-50">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-lg text-red-600 mb-2">Error loading teams</p>
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
                    <Building2 className="h-8 w-8 text-blue-600" />
                    Manage Teams
                </h1>
                <p className="text-muted-foreground text-lg">
                    Create, manage, and oversee organizational teams
                </p>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid gap-4 md:grid-cols-6"
            >
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Teams</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalTeams}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">On Track</p>
                                <p className="text-2xl font-bold text-green-600">{stats.onTrackTeams}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">At Risk</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.atRiskTeams}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Off Track</p>
                                <p className="text-2xl font-bold text-red-600">{stats.offTrackTeams}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Members</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.totalMembers}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Objectives</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.totalObjectives}</p>
                            </div>
                            <Target className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 items-center justify-between"
            >
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search teams by name or manager..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="On Track">On Track</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Off Track">Off Track</option>
                    </select>
                </div>

                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Team
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
                    Showing {filteredTeams.length} of {teams.length} teams
                </p>
            </motion.div>

            {/* Teams Grid */}
            {filteredTeams.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTeams.map((team, index) => (
                        <TeamCard key={team.id} team={team} index={index} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No teams found</p>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}