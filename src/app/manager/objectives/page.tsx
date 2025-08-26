"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Target, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Eye,
  EyeOff,
  Plus,
  Edit,
  MoreHorizontal,

  Save,
  Trash2
} from "lucide-react";

// TypeScript interfaces
interface KeyResult {
  id: string;
  title: string;
  progress: number;
  target: number;
  current: number;
}

interface ObjectiveWithDetails {
  id: string;
  title: string;
  description?: string;
  status: string;
  keyResults: number | KeyResult[];
  progress: number;
  dueDate?: string;
  teamName?: string;
  assignedMembers?: string[];
  createdAt?: string;
}

interface NewKeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
}

interface NewObjective {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  keyResults: NewKeyResult[];
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
      
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
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

// Add Objective Modal Component
function AddObjectiveModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (objective: NewObjective) => void;
}) {
  const [formData, setFormData] = useState<NewObjective>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    dueDate: "",
    keyResults: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addKeyResult = () => {
    const newKeyResult: NewKeyResult = {
      id: `kr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: "",
      targetValue: 0,
      currentValue: 0
    };
    setFormData(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, newKeyResult]
    }));
  };

  const updateKeyResult = (id: string, field: keyof NewKeyResult, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.map(kr => 
        kr.id === id ? { ...kr, [field]: value } : kr
      )
    }));
  };

  const removeKeyResult = (id: string) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.filter(kr => kr.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.keyResults.length === 0) {
      alert("Please add at least one key result");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        dueDate: "",
        keyResults: []
      });
      onClose();
    } catch (error) {
      console.error("Error creating objective:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      dueDate: "",
      keyResults: []
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Create New Objective
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Objective Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter objective title..."
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the objective..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Due Date *
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Key Results Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Key Results
              </h3>
              <Button
                type="button"
                onClick={addKeyResult}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Key Result
              </Button>
            </div>

            {formData.keyResults.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No key results added yet</p>
                <Button
                  type="button"
                  onClick={addKeyResult}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Key Result
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.keyResults.map((kr, index) => (
                  <motion.div
                    key={kr.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Key Result {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeKeyResult(kr.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Key Result Title *
                        </label>
                        <Input
                          value={kr.title}
                          onChange={(e) => updateKeyResult(kr.id, 'title', e.target.value)}
                          placeholder="Enter key result title..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Current Value
                          </label>
                          <Input
                            type="number"
                            value={kr.currentValue}
                            onChange={(e) => updateKeyResult(kr.id, 'currentValue', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Target Value *
                          </label>
                          <Input
                            type="number"
                            value={kr.targetValue}
                            onChange={(e) => updateKeyResult(kr.id, 'targetValue', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      {/* Progress Preview */}
                      {kr.targetValue > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round((kr.currentValue / kr.targetValue) * 100)}%</span>
                          </div>
                          <Progress value={(kr.currentValue / kr.targetValue) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || formData.keyResults.length === 0}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Objective
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced objective card component
function ObjectiveCard({ objective, index }: { objective: ObjectiveWithDetails; index: number }) {
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

  const keyResultsCount = Array.isArray(objective.keyResults) 
    ? objective.keyResults.length 
    : objective.keyResults || 0;

  const keyResultsArray = Array.isArray(objective.keyResults) 
    ? objective.keyResults 
    : [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(objective.dueDate)}</span>
              </div>
              {objective.teamName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{objective.teamName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.variant} className="flex items-center gap-1 shrink-0">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
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
              <span>{keyResultsCount} key result{keyResultsCount !== 1 ? 's' : ''}</span>
            </div>
            
            {keyResultsArray.length > 0 && (
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
            )}
          </div>

          {/* Expandable Key Results */}
          <AnimatePresence>
            {isExpanded && keyResultsArray.length > 0 && (
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
                <div className="space-y-3">
                  {keyResultsArray.map((kr, krIndex) => (
                    <motion.div
                      key={kr.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: krIndex * 0.05 }}
                      className="bg-white/50 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="text-sm font-medium line-clamp-2 flex-1">
                          {kr.title}
                        </h5>
                        <span className="text-xs font-medium text-muted-foreground ml-2">
                          {kr.progress}%
                        </span>
                      </div>
                      <Progress value={kr.progress} className="h-1.5" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {kr.current}</span>
                        <span>Target: {kr.target}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/manager/objectives/${objective.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ManagerObjectivesPage() {
  const [objectives, setObjectives] = useState<ObjectiveWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/manager/objectives");
        if (res.ok) {
          const data = await res.json();
          setObjectives(data);
        } else {
          throw new Error(`Failed to fetch objectives: ${res.status}`);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle objective creation
  const handleCreateObjective = async (newObjective: NewObjective) => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/manager/objectives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newObjective),
      });

      if (res.ok) {
        await res.json();
        // Refresh the objectives list
        const refreshRes = await fetch("/api/manager/objectives");
        if (refreshRes.ok) {
          const updatedData = await refreshRes.json();
          setObjectives(updatedData);
        }
      } else {
        throw new Error("Failed to create objective");
      }
    } catch (err) {
      setError((err as Error).message);
      throw err; // Re-throw to handle in modal
    } finally {
      setIsCreating(false);
    }
  };

  // Filter and search objectives
  const filteredObjectives = useMemo(() => {
    return objectives.filter(obj => {
      // Search filter
      const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (obj.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (obj.teamName || "").toLowerCase().includes(searchQuery.toLowerCase());

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

      return matchesSearch && matchesStatus;
    });
  }, [objectives, searchQuery, statusFilter]);

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
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <ObjectivesSkeleton />
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
            <Target className="h-8 w-8 text-green-600" />
            Team Objectives
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
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-green-600" />
            Team Objectives
          </h1>
        </motion.div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No objectives found</h3>
              <p className="text-gray-600 mb-4">Your team doesn&apos;t have any objectives yet.</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Objective
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Add Objective Modal */}
      <AddObjectiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateObjective}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Target className="h-8 w-8 text-green-600" />
          Team Objectives
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and track your team&apos;s objectives and key results
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
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
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
        </div>
        
        <Button 
          className="gap-2"
          onClick={() => setIsModalOpen(true)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          New Objective
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
          {filteredObjectives.map((obj, index) => (
            <ObjectiveCard key={obj.id} objective={obj} index={index} />
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
    </>
  );
}