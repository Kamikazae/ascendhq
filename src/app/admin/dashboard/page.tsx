"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, 
  Building2, 
  Target, 
  TrendingUp, 
  Clock,
  AlertCircle,
  UserCog,
  Eye,
  BarChart3,
  Activity,
  RefreshCw,
  Shield,
  Settings
} from "lucide-react";

// TypeScript interfaces
interface DashboardStats {
  totalUsers: number;
  totalManagers: number;
  totalMembers: number;
  totalTeams: number;
  activeObjectives: number;
  completedObjectives: number;
  overallProgress: number;
  recentActivity: number;
  healthScore: "Excellent" | "Good" | "Fair" | "Poor";
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

interface TeamOverview {
  id: string;
  name: string;
  memberCount: number;
  managerName: string;
  objectiveCount: number;
  averageProgress: number;
  status: "On Track" | "At Risk" | "Off Track";
}

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
}

// Circular progress component
function CircularProgress({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-purple-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teams, setTeams] = useState<TeamOverview[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, teamsRes, activityRes] = await Promise.all([
          fetch("/api/admin/dashboard/stats"),
          fetch("/api/admin/dashboard/teams"),
          fetch("/api/admin/dashboard/activity")
        ]);

        if (!statsRes.ok || !teamsRes.ok || !activityRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [statsData, teamsData, activityData] = await Promise.all([
          statsRes.json(),
          teamsRes.json(),
          activityRes.json()
        ]);

        setStats(statsData);
        setTeams(teamsData);
        setActivity(activityData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    setError(null);
    // Re-fetch data
    const fetchData = async () => {
      try {
        const [statsRes, teamsRes, activityRes] = await Promise.all([
          fetch("/api/admin/dashboard/stats"),
          fetch("/api/admin/dashboard/teams"),
          fetch("/api/admin/dashboard/activity")
        ]);

        if (!statsRes.ok || !teamsRes.ok || !activityRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [statsData, teamsData, activityData] = await Promise.all([
          statsRes.json(),
          teamsRes.json(),
          activityRes.json()
        ]);

        setStats(statsData);
        setTeams(teamsData);
        setActivity(activityData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse" />
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

  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-lg text-red-600 mb-2">Error loading dashboard</p>
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

  if (!stats) return null;

  // Get health score color
  const getHealthColor = (score: string) => {
    switch (score) {
      case "Excellent": return "text-green-600";
      case "Good": return "text-blue-600";
      case "Fair": return "text-yellow-600";
      case "Poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            System overview and organizational management
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Enhanced Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  <AnimatedCounter value={stats.totalUsers} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalManagers} managers, {stats.totalMembers} members
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Teams</p>
                <p className="text-2xl font-bold text-green-600">
                  <AnimatedCounter value={stats.totalTeams} />
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Objectives</p>
                <p className="text-2xl font-bold text-purple-600">
                  <AnimatedCounter value={stats.activeObjectives} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedObjectives} completed
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  <AnimatedCounter value={stats.overallProgress} />%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className={`text-2xl font-bold ${getHealthColor(stats.healthScore)}`}>
                  {stats.healthScore}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.recentActivity} recent updates
                </p>
              </div>
              <Shield className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              System Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{stats.overallProgress}%</span>
                </div>
                <Progress value={stats.overallProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  System health: {stats.healthScore} • {stats.recentActivity} recent activities
                </p>
              </div>
            </div>
            <div className="ml-8">
              <CircularProgress value={stats.overallProgress} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teams Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-500" />
                Teams Overview
              </CardTitle>
              <Link href="/admin/manage-teams">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {teams.length > 0 ? (
                teams.slice(0, 4).map((team, index) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case "On Track": return "border-l-green-200 bg-green-50";
                      case "At Risk": return "border-l-yellow-200 bg-yellow-50";
                      case "Off Track": return "border-l-red-200 bg-red-50";
                      default: return "border-l-gray-200 bg-gray-50";
                    }
                  };
                  
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${getStatusColor(team.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{team.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {team.memberCount} members
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{team.averageProgress}%</span>
                        </div>
                        <Progress value={team.averageProgress} className="h-1.5" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Manager: {team.managerName}</span>
                          <span>{team.objectiveCount} objectives</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No teams found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.length > 0 ? (
                activity.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">by {item.user}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <Link href="/admin/manage-teams">
                <Button className="w-full justify-start gap-2 h-12">
                  <Building2 className="h-4 w-4" />
                  Manage Teams
                </Button>
              </Link>
              <Link href="/admin/manage-managers">
                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                  <UserCog className="h-4 w-4" />
                  Manage Managers
                </Button>
              </Link>
              <Link href="/admin/manage-members">
                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                  <Users className="h-4 w-4" />
                  Manage Members
                </Button>
              </Link>
              <Link href="/admin/manage-objectives">
                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                  <Target className="h-4 w-4" />
                  Objectives
                </Button>
              </Link>
              <Link href="/admin/progress-reports">
                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                  <BarChart3 className="h-4 w-4" />
                  Reports
                </Button>
              </Link>
              <Link href="/admin/system-settings">
                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}