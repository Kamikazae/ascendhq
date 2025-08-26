"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Search, 
  Download, 
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Building2
} from "lucide-react";

// TypeScript interfaces
interface ProgressUpdate {
  id: string;
  userName: string;
  userRole: string;
  teamName: string;
  objectiveTitle: string;
  keyResultTitle: string;
  oldValue: number;
  newValue: number;
  comment?: string;
  timestamp: string;
  changeType: "increase" | "decrease" | "no_change";
}

interface TeamProgress {
  teamName: string;
  totalObjectives: number;
  completedObjectives: number;
  averageProgress: number;
  status: "On Track" | "At Risk" | "Off Track";
  lastUpdate: string;
  memberCount: number;
}

interface ProgressSummary {
  totalUpdates: number;
  activeUsers: number;
  averageProgress: number;
  onTrackTeams: number;
  atRiskTeams: number;
  offTrackTeams: number;
}

// Helper function to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString();
}

// Progress update card component
function ProgressUpdateCard({ update, index }: { update: ProgressUpdate; index: number }) {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case "increase": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decrease": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case "increase": return "text-green-600 bg-green-50 border-green-200";
      case "decrease": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`hover:shadow-md transition-all duration-300 border-l-4 ${getChangeColor(update.changeType)}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getChangeIcon(update.changeType)}
                <h4 className="font-medium text-sm">{update.objectiveTitle}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{update.keyResultTitle}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{update.userName}</span>
                  <Badge variant="outline" className="text-xs">{update.userRole}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">{update.teamName}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{update.oldValue}%</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{update.newValue}%</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  update.changeType === "increase" ? "bg-green-100 text-green-700" :
                  update.changeType === "decrease" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {update.newValue - update.oldValue > 0 ? "+" : ""}{update.newValue - update.oldValue}%
                </span>
              </div>

              {update.comment && (
                <p className="text-xs text-muted-foreground mt-2 italic">&ldquo;{update.comment}&rdquo;</p>
              )}
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDateTime(update.timestamp)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Team progress card component
function TeamProgressCard({ team, index }: { team: TeamProgress; index: number }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track": return "border-green-200 bg-green-50";
      case "At Risk": return "border-yellow-200 bg-yellow-50";
      case "Off Track": return "border-red-200 bg-red-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "On Track": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "At Risk": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "Off Track": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getStatusColor(team.status)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              {team.teamName}
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              {getStatusIcon(team.status)}
              {team.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{team.averageProgress}%</p>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{team.completedObjectives}/{team.totalObjectives}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{team.memberCount} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Updated {formatDate(team.lastUpdate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProgressReportsPage() {
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"updates" | "teams">("updates");

  useEffect(() => {
    async function fetchData() {
      try {
        const [updatesRes, teamsRes, summaryRes] = await Promise.all([
          fetch("/api/admin/progress-reports/updates"),
          fetch("/api/admin/progress-reports/teams"),
          fetch("/api/admin/progress-reports/summary")
        ]);

        if (!updatesRes.ok || !teamsRes.ok || !summaryRes.ok) {
          throw new Error("Failed to load progress reports data.");
        }

        const [updatesData, teamsData, summaryData] = await Promise.all([
          updatesRes.json(),
          teamsRes.json(),
          summaryRes.json()
        ]);

        setUpdates(updatesData);
        setTeams(teamsData);
        setSummary(summaryData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get unique teams for filter
  const uniqueTeams = useMemo(() => {
    const teamNames = Array.from(new Set(updates.map(update => update.teamName)));
    return teamNames.sort();
  }, [updates]);

  // Filter updates based on search and filters
  const filteredUpdates = useMemo(() => {
    return updates.filter((update) => {
      const matchesSearch = update.userName.toLowerCase().includes(search.toLowerCase()) ||
                           update.objectiveTitle.toLowerCase().includes(search.toLowerCase()) ||
                           update.teamName.toLowerCase().includes(search.toLowerCase());
      
      const matchesTeam = teamFilter === "all" || update.teamName === teamFilter;
      
      // Date filter logic
      let matchesDate = true;
      if (dateFilter !== "all") {
        const updateDate = new Date(update.timestamp);
        const now = new Date();
        
        switch (dateFilter) {
          case "today":
            matchesDate = updateDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = updateDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = updateDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesTeam && matchesDate;
    });
  }, [updates, search, teamFilter, dateFilter]);

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
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-lg text-red-600 mb-2">Error loading progress reports</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
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
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Progress Reports
        </h1>
        <p className="text-muted-foreground text-lg">
          Track contributions, team progress, and system activity
        </p>
      </motion.div>

      {/* Summary Stats */}
      {summary && (
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
                  <p className="text-sm text-muted-foreground">Total Updates</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalUpdates}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{summary.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.averageProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">On Track</p>
                  <p className="text-2xl font-bold text-green-600">{summary.onTrackTeams}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{summary.atRiskTeams}</p>
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
                  <p className="text-2xl font-bold text-red-600">{summary.offTrackTeams}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-4"
      >
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("updates")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "updates" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Progress Updates
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "teams" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Team Progress
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search updates, users, or objectives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {activeTab === "updates" && (
            <>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>

              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </>
          )}
        </div>
        
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </motion.div>

      {/* Content */}
      {activeTab === "updates" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUpdates.length} of {updates.length} progress updates
          </p>
          
          {filteredUpdates.length > 0 ? (
            <div className="space-y-4">
              {filteredUpdates.map((update, index) => (
                <ProgressUpdateCard key={update.id} update={update} index={index} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No updates found</p>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {teams.length} teams
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, index) => (
              <TeamProgressCard key={team.teamName} team={team} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}