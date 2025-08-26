"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Target, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  AlertCircle
} from "lucide-react";

// TypeScript interfaces
interface Objective {
  id: string;
  title: string;
  description: string;
  teamName: string;
  teamId: string;
  managerName: string;
  status: "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
  progress: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  keyResultsCount: number;
  isOverdue: boolean;
  daysUntilDue: number;
}

// Status configuration
const statusConfig = {
  "ON_TRACK": {
    variant: "default" as const,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
    label: "On Track"
  },
  "AT_RISK": {
    variant: "secondary" as const,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: AlertTriangle,
    label: "At Risk"
  },
  "OFF_TRACK": {
    variant: "destructive" as const,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertCircle,
    label: "Off Track"
  }
};

// Enhanced objective card component
function ObjectiveCard({ objective, index }: { objective: Objective; index: number }) {
  const statusConf = statusConfig[objective.status];
  const StatusIcon = statusConf.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days remaining`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${statusConf.borderColor} ${statusConf.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                {objective.title}
                <Target className="h-4 w-4 text-purple-500" />
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {objective.description}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge variant={statusConf.variant} className={`${statusConf.bgColor} flex items-center gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {statusConf.label}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Team and Manager Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{objective.teamName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">{objective.managerName}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{objective.progress}%</span>
            </div>
            <Progress value={objective.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {objective.keyResultsCount} key result{objective.keyResultsCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Timeline</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Start</p>
                <p className="font-medium">{formatDate(objective.startDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">End</p>
                <p className="font-medium">{formatDate(objective.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Due Date Warning */}
          <div className={`p-2 rounded-lg ${objective.isOverdue ? 'bg-red-50 border border-red-200' : objective.daysUntilDue <= 7 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 text-sm">
              <Clock className={`h-4 w-4 ${objective.isOverdue ? 'text-red-500' : objective.daysUntilDue <= 7 ? 'text-yellow-500' : 'text-gray-500'}`} />
              <span className={objective.isOverdue ? 'text-red-600 font-medium' : objective.daysUntilDue <= 7 ? 'text-yellow-600 font-medium' : 'text-gray-600'}>
                {getDaysText(objective.daysUntilDue)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Edit className="h-4 w-4" />
              Reassign
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ManageObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchObjectives() {
      try {
        const res = await fetch("/api/admin/manage-objectives");
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          } else if (res.status === 403) {
            throw new Error("Admin access required.");
          } else {
            throw new Error("Failed to load objectives data.");
          }
        }
        const data = await res.json();
        setObjectives(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchObjectives();
  }, []);

  // Get unique teams for filter
  const teams = useMemo(() => {
    const uniqueTeams = Array.from(new Set(objectives.map(obj => obj.teamName)));
    return uniqueTeams.sort();
  }, [objectives]);

  // Filter objectives based on search and filters
  const filteredObjectives = useMemo(() => {
    return objectives.filter((objective) => {
      const matchesSearch = objective.title.toLowerCase().includes(search.toLowerCase()) ||
                           objective.description.toLowerCase().includes(search.toLowerCase()) ||
                           objective.teamName.toLowerCase().includes(search.toLowerCase()) ||
                           objective.managerName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || objective.status === statusFilter;
      const matchesTeam = teamFilter === "all" || objective.teamName === teamFilter;
      
      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [objectives, search, statusFilter, teamFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalObjectives = objectives.length;
    const onTrackObjectives = objectives.filter(o => o.status === "ON_TRACK").length;
    const atRiskObjectives = objectives.filter(o => o.status === "AT_RISK").length;
    const offTrackObjectives = objectives.filter(o => o.status === "OFF_TRACK").length;
    const overdueObjectives = objectives.filter(o => o.isOverdue).length;
    const averageProgress = objectives.length > 0 
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
      : 0;

    return { 
      totalObjectives, 
      onTrackObjectives, 
      atRiskObjectives, 
      offTrackObjectives, 
      overdueObjectives,
      averageProgress 
    };
  }, [objectives]);

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
                <div className="h-48 bg-gray-200 rounded" />
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
            <Target className="h-8 w-8 text-purple-600" />
            Manage Objectives
          </h1>
        </motion.div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg text-red-600 mb-2">Error loading objectives</p>
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
          <Target className="h-8 w-8 text-purple-600" />
          Manage Objectives
        </h1>
        <p className="text-muted-foreground text-lg">
          Oversee all objectives across teams and track progress
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-6"
      >
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalObjectives}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-green-600">{stats.onTrackObjectives}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRiskObjectives}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Off Track</p>
                <p className="text-2xl font-bold text-red-600">{stats.offTrackObjectives}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-orange-600">{stats.overdueObjectives}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
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
              placeholder="Search objectives, teams, or managers..."
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
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="OFF_TRACK">Off Track</option>
          </select>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Objective
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
          Showing {filteredObjectives.length} of {objectives.length} objectives
        </p>
      </motion.div>

      {/* Objectives Grid */}
      {filteredObjectives.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredObjectives.map((objective, index) => (
            <ObjectiveCard key={objective.id} objective={objective} index={index} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 mb-2">No objectives found</p>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}