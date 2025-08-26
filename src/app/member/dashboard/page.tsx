"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Target, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Plus,
  BookOpen,
  UserCheck
} from "lucide-react";

// TypeScript interfaces matching the API response
interface RecentObjective {
  id: string;
  title: string;
  status: string;
  progress: number;
  teamName: string;
}

interface ProgressBreakdown {
  category: string;
  progress: number;
}

interface MemberDashboardStats {
  objectives: number;
  completed: number;
  teams: number;
  progress: number;
  recentObjectives: RecentObjective[];
  breakdown: ProgressBreakdown[];
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
          className="text-blue-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  );
}

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-40" />
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function MemberDashboard() {
  const [dashboardData, setDashboardData] = useState<MemberDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/member/dashboard");

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          } else if (res.status === 403) {
            throw new Error("Access denied. Member permissions required.");
          } else if (res.status === 503) {
            throw new Error("Service temporarily unavailable. Please try again later.");
          } else {
            throw new Error("Failed to load dashboard data.");
          }
        }

        const data: MemberDashboardStats = await res.json();
        setDashboardData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Loading state with skeleton
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold">👋 Welcome back!</h1>
          <p className="text-muted-foreground">Something went wrong loading your dashboard.</p>
        </motion.div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg text-red-600 mb-2">Error loading dashboard</p>
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

  if (!dashboardData) return null;

  const completionRate = dashboardData.objectives > 0 
    ? Math.round((dashboardData.completed / dashboardData.objectives) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          👋 Welcome back!
        </h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s your progress overview and recent activity.
        </p>
      </motion.div>

      {/* Enhanced Stats Row */}
      <motion.div 
        className="grid gap-6 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Objectives
            </CardTitle>
            <Target className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              <AnimatedCounter value={dashboardData.objectives} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all teams
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              <AnimatedCounter value={dashboardData.completed} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teams
            </CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              <AnimatedCounter value={dashboardData.teams} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active memberships
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              <AnimatedCounter value={dashboardData.progress} />%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across objectives
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{dashboardData.progress}%</span>
                </div>
                <Progress value={dashboardData.progress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {dashboardData.completed} of {dashboardData.objectives} objectives completed
                </p>
              </div>
            </div>
            <div className="ml-8">
              <CircularProgress value={dashboardData.progress} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enhanced Recent Objectives */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Recent Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentObjectives.length > 0 ? (
                dashboardData.recentObjectives.map((obj, index) => (
                  <motion.div
                    key={obj.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{obj.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{obj.teamName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{obj.progress}% complete</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        obj.status === "Completed"
                          ? "default"
                          : obj.status === "In Progress"
                          ? "secondary"
                          : "outline"
                      }
                      className="ml-3"
                    >
                      {obj.status}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No recent objectives</p>
                </div>
              )}
              <Button variant="ghost" className="w-full justify-between group">
                View All Objectives
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Progress Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Team Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.breakdown.length > 0 ? (
                dashboardData.breakdown.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground font-medium">
                        {item.progress}%
                      </span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No progress data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Quick Actions */}
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
            <div className="grid gap-3 sm:grid-cols-3">
              <Button className="justify-start gap-2 h-12">
                <Plus className="h-4 w-4" />
                Add Progress Update
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-12">
                <BookOpen className="h-4 w-4" />
                My Objectives
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-12">
                <UserCheck className="h-4 w-4" />
                My Teams
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}