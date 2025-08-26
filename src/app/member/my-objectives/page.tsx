"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Eye,
  EyeOff,
  Edit,
  Save,
  X
} from "lucide-react";

// TypeScript interfaces matching the API response
interface KeyResultData {
  id: string;
  title: string;
  progress: number;
  target: number;
  current: number;
}

interface ObjectiveWithDetails {
  id: string;
  title: string;
  description: string;
  progress: number;
  teamId: string;
  teamName: string;
  keyResults: KeyResultData[];
}

interface MyObjectivesResponse {
  objectives: ObjectiveWithDetails[];
}

type StatusType = "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETED";
type FilterType = "all" | "on_track" | "at_risk" | "off_track" | "completed";

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

// Skeleton loading component
function ObjectivesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse" />
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded-md w-64 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse" />
        </div>
      </div>
      
      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Key Result Card Component with Progress Update
function KeyResultCard({ 
  keyResult, 
  onUpdate 
}: { 
  keyResult: KeyResultData; 
  onUpdate: (keyResultId: string, newCurrent: number, comment?: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(keyResult.current);
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (currentValue === keyResult.current) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(keyResult.id, currentValue, comment);
      setIsEditing(false);
      setComment("");
    } catch (error) {
      console.error("Error updating key result:", error);
      setCurrentValue(keyResult.current); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(keyResult.current);
    setComment("");
    setIsEditing(false);
  };

  const progressPercentage = keyResult.target > 0 ? Math.min((currentValue / keyResult.target) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white/50 rounded-lg p-4 space-y-3 border border-gray-100"
    >
      <div className="flex justify-between items-start">
        <h5 className="text-sm font-medium line-clamp-2 flex-1">
          {keyResult.title}
        </h5>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs font-medium text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Current Value</label>
              <Input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                className="h-8 text-sm"
                min="0"
                max={keyResult.target}
              />
            </div>
            <div className="text-xs text-gray-500 pt-4">
              / {keyResult.target}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Update Comment (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about this update..."
              className="h-16 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="h-7 px-3 text-xs"
            >
              {isUpdating ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isUpdating}
              className="h-7 px-3 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Current: {keyResult.current}</span>
          <span>Target: {keyResult.target}</span>
        </div>
      )}
    </motion.div>
  );
}

// Enhanced objective card component
function ObjectiveCard({ 
  objective, 
  index, 
  onKeyResultUpdate 
}: { 
  objective: ObjectiveWithDetails; 
  index: number;
  onKeyResultUpdate: (objectiveId: string, keyResultId: string, newCurrent: number, comment?: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatus = (progress: number): StatusType => {
    if (progress >= 100) return "COMPLETED";
    if (progress >= 80) return "ON_TRACK";
    if (progress >= 50) return "AT_RISK";
    return "OFF_TRACK";
  };

  const status = getStatus(objective.progress);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleKeyResultUpdate = (keyResultId: string, newCurrent: number, comment?: string) => {
    onKeyResultUpdate(objective.id, keyResultId, newCurrent, comment);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${config.borderColor} ${config.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                {objective.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{objective.teamName}</span>
              </div>
            </div>
            <Badge variant={config.variant} className="flex items-center gap-1 shrink-0">
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className={`text-sm font-bold ${config.color}`}>
                {objective.progress}%
              </span>
            </div>
            <Progress value={objective.progress} className="h-2" />
          </div>

          {/* Description */}
          {objective.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {objective.description}
            </p>
          )}

          {/* Key Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>{objective.keyResults.length} key result{objective.keyResults.length !== 1 ? 's' : ''}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </>
              )}
              {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Expandable Key Results */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 pt-3 border-t"
              >
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Key Results
                </h4>
                {objective.keyResults.length > 0 ? (
                  <div className="space-y-3">
                    {objective.keyResults.map((kr) => (
                      <KeyResultCard
                        key={kr.id}
                        keyResult={kr}
                        onUpdate={handleKeyResultUpdate}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No key results defined yet
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MyObjectives() {
  const [objectives, setObjectives] = useState<ObjectiveWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchObjectives() {
      try {
        const res = await fetch("/api/member/my-objectives");

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          } else if (res.status === 403) {
            throw new Error("Access denied. Member permissions required.");
          } else if (res.status === 503) {
            throw new Error("Service temporarily unavailable. Please try again later.");
          } else {
            throw new Error("Failed to load objectives data.");
          }
        }

        const data: MyObjectivesResponse = await res.json();
        setObjectives(data.objectives);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchObjectives();
  }, []);

  // Handle key result progress updates
  const handleKeyResultUpdate = async (
    objectiveId: string, 
    keyResultId: string, 
    newCurrent: number, 
    comment?: string
  ) => {
    try {
      const res = await fetch(`/api/member/key-results/${keyResultId}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          current: newCurrent,
          comment: comment || `Updated progress to ${newCurrent}`
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update progress");
      }

      const updatedKeyResult = await res.json();

      // Update the local state
      setObjectives(prev => prev.map(obj => {
        if (obj.id === objectiveId) {
          const updatedKeyResults = obj.keyResults.map(kr => 
            kr.id === keyResultId 
              ? { ...kr, current: newCurrent, progress: updatedKeyResult.progress }
              : kr
          );
          
          // Recalculate objective progress
          const totalProgress = updatedKeyResults.reduce((sum, kr) => sum + kr.progress, 0);
          const avgProgress = updatedKeyResults.length > 0 ? Math.round(totalProgress / updatedKeyResults.length) : 0;
          
          return {
            ...obj,
            keyResults: updatedKeyResults,
            progress: avgProgress
          };
        }
        return obj;
      }));

      // Show success message
      setUpdateSuccess(`Progress updated successfully!`);
      setTimeout(() => setUpdateSuccess(null), 3000);

    } catch (error) {
      console.error("Error updating key result:", error);
      throw error; // Re-throw to handle in component
    }
  };

  // Get unique teams for filter
  const teams = useMemo(() => {
    const uniqueTeams = Array.from(new Set(objectives.map(obj => obj.teamName)));
    return uniqueTeams.sort();
  }, [objectives]);

  // Filter and search objectives
  const filteredObjectives = useMemo(() => {
    return objectives.filter(obj => {
      // Search filter
      const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           obj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           obj.teamName.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const getStatus = (progress: number): StatusType => {
        if (progress >= 100) return "COMPLETED";
        if (progress >= 80) return "ON_TRACK";
        if (progress >= 50) return "AT_RISK";
        return "OFF_TRACK";
      };

      const status = getStatus(obj.progress);
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "on_track" && status === "ON_TRACK") ||
                           (statusFilter === "at_risk" && status === "AT_RISK") ||
                           (statusFilter === "off_track" && status === "OFF_TRACK") ||
                           (statusFilter === "completed" && status === "COMPLETED");

      // Team filter
      const matchesTeam = teamFilter === "all" || obj.teamName === teamFilter;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [objectives, searchQuery, statusFilter, teamFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = objectives.length;
    const completed = objectives.filter(obj => obj.progress >= 100).length;
    const onTrack = objectives.filter(obj => obj.progress >= 80 && obj.progress < 100).length;
    const atRisk = objectives.filter(obj => obj.progress >= 50 && obj.progress < 80).length;
    const offTrack = objectives.filter(obj => obj.progress < 50).length;
    const avgProgress = total > 0 ? Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / total) : 0;

    return { total, completed, onTrack, atRisk, offTrack, avgProgress };
  }, [objectives]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <ObjectivesSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            My Objectives
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

  // No objectives state
  if (objectives.length === 0) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            My Objectives
          </h1>
        </motion.div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No objectives found</h3>
              <p className="text-gray-600 mb-4">You don&apos;t have any objectives assigned yet.</p>
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Explore Teams
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Target className="h-8 w-8 text-blue-600" />
          My Objectives
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your progress across all team objectives
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-5"
      >
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.onTrack}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterType)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="off_track">Off Track</option>
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

      {/* Success Message */}
      <AnimatePresence>
        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-green-800 font-medium">{updateSuccess}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Objectives Grid */}
      {filteredObjectives.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredObjectives.map((obj, index) => (
            <ObjectiveCard 
              key={obj.id} 
              objective={obj} 
              index={index}
              onKeyResultUpdate={handleKeyResultUpdate}
            />
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