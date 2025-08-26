"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
  Eye,
  Plus
} from "lucide-react";

type DashboardData = {
  teamName: string;
  completion: number;
  objectives: { id: string; title: string; status: string; progress?: number }[];
  recentUpdates: { id: string; member: string; comment: string; date: string }[];
};

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
          className="text-green-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  );
}

// Status configuration
const statusConfig = {
  ON_TRACK: {
    label: "On Track",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  AT_RISK: {
    label: "At Risk",
    variant: "secondary" as const,
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  OFF_TRACK: {
    label: "Off Track",
    variant: "destructive" as const,
    icon: Clock,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
};

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/manager/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

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

  if (!data) return null;

  // Calculate stats
  const totalMembers = 8; // Mock data
  const activeObjectives = data.objectives.length;
  const completedObjectives = data.objectives.filter(obj => obj.status === 'COMPLETED').length;
  const avgProgress = data.completion;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Manager Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor your team&apos;s progress and performance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold text-blue-600">
                  <AnimatedCounter value={totalMembers} />
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
                <p className="text-sm text-muted-foreground">Active Objectives</p>
                <p className="text-2xl font-bold text-green-600">
                  <AnimatedCounter value={activeObjectives} />
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-purple-600">
                  <AnimatedCounter value={completedObjectives} />
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  <AnimatedCounter value={avgProgress} />%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Progress Overview */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {data.teamName} Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Team Progress</span>
                <span className="font-medium">{data.completion}%</span>
              </div>
              <Progress value={data.completion} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Based on all objectives and key results
              </p>
            </div>
          </div>
          <div className="ml-8">
            <CircularProgress value={data.completion} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Objectives Status */}
        <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Team Objectives
            </CardTitle>
            <Link href="/manager/objectives">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.objectives.length > 0 ? (
              data.objectives.map((obj) => {
                const config = statusConfig[obj.status as keyof typeof statusConfig] || statusConfig.OFF_TRACK;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={obj.id}
                    className={`p-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{obj.title}</h4>
                      <Badge variant={config.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                    {obj.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{obj.progress}%</span>
                        </div>
                        <Progress value={obj.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No objectives found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Recent Progress Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentUpdates.length > 0 ? (
              data.recentUpdates.map((update) => (
                <div
                  key={update.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{update.member}</p>
                      <p className="text-sm text-muted-foreground mt-1">{update.comment}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3">
                      <Calendar className="h-3 w-3" />
                      {new Date(update.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent updates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/manager/objectives">
              <Button className="w-full justify-start gap-2 h-12">
                <Target className="h-4 w-4" />
                Manage Objectives
              </Button>
            </Link>
            <Link href="/manager/members">
              <Button variant="outline" className="w-full justify-start gap-2 h-12">
                <Users className="h-4 w-4" />
                View Team Members
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start gap-2 h-12">
              <Plus className="h-4 w-4" />
              Add New Objective
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}