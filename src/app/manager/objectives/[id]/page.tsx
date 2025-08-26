"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";



import { motion } from "framer-motion";
import { 
  Target, 
  ArrowLeft,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Edit,
  Save,
  X,
  Plus,
  MoreHorizontal,
  Activity,
  Settings
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// TypeScript interfaces
interface KeyResult {
  id: string;
  title: string;
  description?: string;
  progress: number;
  target: number;
  current: number;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ObjectiveDetail {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  teamName?: string;
  assignedMembers?: string[];
  keyResults: KeyResult[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

interface UpdateEntry {
  id: string;
  type: 'progress' | 'comment' | 'key_result' | 'status';
  message: string;
  author: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

type StatusType = "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETED";

// Enhanced status configuration
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
  },
  COMPLETED: {
    label: "Completed",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  }
};

// Loading skeleton component
function ObjectiveDetailSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-96 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      {/* Main content skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Objective info skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </CardContent>
          </Card>
          
          {/* Key results skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Key Result Card Component
function KeyResultCard({ keyResult, onUpdate }: { 
  keyResult: KeyResult; 
  onUpdate: (id: string, current: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(keyResult.current);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(keyResult.id, currentValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating key result:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const progressPercentage = keyResult.target > 0 ? Math.min((keyResult.current / keyResult.target) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{keyResult.title}</h4>
            {keyResult.description && (
              <p className="text-sm text-gray-600">{keyResult.description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Values */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Current: </span>
              {isEditing ? (
                <Input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                  className="inline-block w-20 h-8 text-sm"
                  min="0"
                />
              ) : (
                <span className="font-medium">
                  {keyResult.current}{keyResult.unit && ` ${keyResult.unit}`}
                </span>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Target: </span>
              <span className="font-medium">
                {keyResult.target}{keyResult.unit && ` ${keyResult.unit}`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="h-8 px-3"
                >
                  {isUpdating ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentValue(keyResult.current);
                  }}
                  className="h-8 px-3"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 px-3"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Last updated */}
        {keyResult.updatedAt && (
          <div className="text-xs text-gray-500">
            Last updated: {new Date(keyResult.updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ObjectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectiveId = params.id as string;

  const [objective, setObjective] = useState<ObjectiveDetail | null>(null);
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    async function loadObjective() {
      try {
        const res = await fetch(`/api/manager/objectives/${objectiveId}`);
        if (res.ok) {
          const data = await res.json();
          setObjective(data);
          setNewDescription(data.description || "");
        } else if (res.status === 404) {
          setError("Objective not found");
        } else {
          throw new Error(`Failed to fetch objective: ${res.status}`);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    async function loadUpdates() {
      try {
        const res = await fetch(`/api/manager/objectives/${objectiveId}/updates`);
        if (res.ok) {
          const data = await res.json();
          setUpdates(data);
        }
      } catch (err) {
        console.error("Failed to load updates:", err);
      }
    }

    if (objectiveId) {
      loadObjective();
      loadUpdates();
    }
  }, [objectiveId]);

  const handleKeyResultUpdate = async (keyResultId: string, newCurrent: number) => {
    if (!objective) return;

    try {
      const res = await fetch(`/api/manager/objectives/${objectiveId}/key-results/${keyResultId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ current: newCurrent }),
      });

      if (res.ok) {
        await res.json();
        
        // Update the objective state
        setObjective(prev => {
          if (!prev) return prev;
          
          const updatedKeyResults = prev.keyResults.map(kr => 
            kr.id === keyResultId ? { ...kr, current: newCurrent, progress: Math.min((newCurrent / kr.target) * 100, 100) } : kr
          );
          
          // Recalculate overall progress
          const totalProgress = updatedKeyResults.reduce((sum, kr) => sum + kr.progress, 0);
          const avgProgress = updatedKeyResults.length > 0 ? totalProgress / updatedKeyResults.length : 0;
          
          return {
            ...prev,
            keyResults: updatedKeyResults,
            progress: Math.round(avgProgress)
          };
        });
      } else {
        throw new Error("Failed to update key result");
      }
    } catch (err) {
      console.error("Error updating key result:", err);
      throw err;
    }
  };

  const handleDescriptionUpdate = async () => {
    if (!objective) return;

    try {
      const res = await fetch(`/api/manager/objectives/${objectiveId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: newDescription }),
      });

      if (res.ok) {
        setObjective(prev => prev ? { ...prev, description: newDescription } : prev);
        setIsEditingDescription(false);
      } else {
        throw new Error("Failed to update description");
      }
    } catch (err) {
      console.error("Error updating description:", err);
    }
  };

  const getStatus = (progress: number): StatusType => {
    if (progress >= 100) return "COMPLETED";
    if (progress >= 80) return "ON_TRACK";
    if (progress >= 50) return "AT_RISK";
    return "OFF_TRACK";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return <ObjectiveDetailSkeleton />;
  }

  // Error state
  if (error || !objective) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Objectives
        </Button>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg text-red-600 mb-2">
                {error === "Objective not found" ? "Objective not found" : "Error loading objective"}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {error === "Objective not found" 
                  ? "The objective you're looking for doesn't exist or has been deleted."
                  : error
                }
              </p>
              <Button
                onClick={() => router.push('/manager/objectives')}
                className="bg-red-600 hover:bg-red-700"
              >
                Back to Objectives
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getStatus(objective.progress);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Objectives
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {objective.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {objective.teamName && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{objective.teamName}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(objective.dueDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={config.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objective Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`border-l-4 ${config.borderColor}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Objective Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className={`text-lg font-bold ${config.color}`}>
                      {objective.progress}%
                    </span>
                  </div>
                  <Progress value={objective.progress} className="h-3" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Description</h4>
                    {!isEditingDescription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {isEditingDescription ? (
                    <div className="space-y-3">
                      <Textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Add a description for this objective..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleDescriptionUpdate}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingDescription(false);
                            setNewDescription(objective.description || "");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {objective.description || "No description provided."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Key Results ({objective.keyResults.length})
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key Result
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {objective.keyResults.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No key results defined</p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Key Result
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {objective.keyResults.map((keyResult) => (
                      <KeyResultCard
                        key={keyResult.id}
                        keyResult={keyResult}
                        onUpdate={handleKeyResultUpdate}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-sm">{formatDate(objective.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-sm">{formatDate(objective.endDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="text-sm">{formatDate(objective.dueDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{formatDate(objective.createdAt)}</p>
                </div>
                {objective.createdBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created By</label>
                    <p className="text-sm">{objective.createdBy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members */}
          {objective.assignedMembers && objective.assignedMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assigned Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {objective.assignedMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {member.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{member}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {updates.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {updates.slice(0, 5).map((update) => (
                      <div key={update.id} className="text-sm">
                        <p className="text-gray-900">{update.message}</p>
                        <p className="text-xs text-gray-500">
                          {update.author} • {new Date(update.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}