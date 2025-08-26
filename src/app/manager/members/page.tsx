"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  User, 
  Search, 
  Mail,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  UserPlus
} from "lucide-react";

// TypeScript interfaces
interface Contribution {
  id: string;
  keyResultTitle: string;
  newValue: number;
  progress?: number;
  date?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  user?: {
    name: string;
    email: string;
  };
  contributions: Contribution[];
  totalContributions?: number;
  avgProgress?: number;
  lastActive?: string;
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

// Role configuration
const roleConfig = {
  LEAD: {
    label: "Team Lead",
    variant: "default" as const,
    icon: Users,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  MEMBER: {
    label: "Member",
    variant: "secondary" as const,
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  ADMIN: {
    label: "Admin",
    variant: "destructive" as const,
    icon: CheckCircle2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
};

// Skeleton loading component
function MembersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded-md w-64 animate-pulse" />
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
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-20 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Enhanced member card component
function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const config = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.MEMBER;
  const RoleIcon = config.icon;
  
  const memberName = member.user?.name || member.name || "Unknown";
  const memberEmail = member.user?.email || member.email || "";
  
  // Calculate member stats
  const totalContributions = member.contributions?.length || 0;
  const avgProgress = totalContributions > 0 
    ? Math.round(member.contributions.reduce((sum, c) => sum + (c.progress || c.newValue || 0), 0) / totalContributions)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${config.borderColor} ${config.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className={`h-12 w-12 ${getAvatarColor(memberName)} text-white border-2 border-white shadow-md`}>
              <AvatarFallback className="font-medium text-white">
                {getInitials(memberName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">{memberName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
                  <RoleIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
              {memberEmail && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{memberEmail}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Member Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Contributions</p>
                <p className="text-lg font-bold text-blue-600">{totalContributions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
                <p className="text-lg font-bold text-green-600">{avgProgress}%</p>
              </div>
            </div>
          </div>

          {/* Contributions Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Recent Activity</p>
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

            {/* Quick Preview */}
            {!isExpanded && (
              <div className="space-y-1">
                {totalContributions > 0 ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span>Overall Progress</span>
                      <span>{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {totalContributions} contribution{totalContributions !== 1 ? 's' : ''} made
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No contributions yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Expandable Contributions List */}
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
                    Detailed Contributions
                  </h4>
                  {member.contributions && member.contributions.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {member.contributions.map((contribution, cIndex) => (
                        <motion.div
                          key={contribution.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: cIndex * 0.05 }}
                          className="bg-white/70 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <h5 className="text-sm font-medium line-clamp-2 flex-1">
                              {contribution.keyResultTitle}
                            </h5>
                            <span className="text-xs font-medium text-muted-foreground ml-2">
                              {contribution.progress || contribution.newValue || 0}%
                            </span>
                          </div>
                          <Progress value={contribution.progress || contribution.newValue || 0} className="h-1.5" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No contributions recorded</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ManagerMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/manager/members");
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        } else {
          throw new Error(`Failed to fetch members: ${res.status}`);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const name = member.user?.name || member.name || "";
      const email = member.user?.email || member.email || "";
      const role = member.role || "";
      
      return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             role.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [members, searchQuery]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const totalContributions = members.reduce((sum, member) => sum + (member.contributions?.length || 0), 0);
    const activeMembers = members.filter(member => (member.contributions?.length || 0) > 0).length;
    const avgContributions = totalMembers > 0 ? Math.round(totalContributions / totalMembers) : 0;

    return { totalMembers, totalContributions, activeMembers, avgContributions };
  }, [members]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <MembersSkeleton />
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
            <Users className="h-8 w-8 text-green-600" />
            Team Members
          </h1>
        </motion.div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg text-red-600 mb-2">Error loading team members</p>
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

  // No members state
  if (members.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            Team Members
          </h1>
        </motion.div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600 mb-4">Your team doesn&apos;t have any members yet.</p>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
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
          <Users className="h-8 w-8 text-green-600" />
          Team Members
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and monitor your team&apos;s performance and contributions
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeMembers}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contributions</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalContributions}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Contributions</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgContributions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button className="ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
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
          Showing {filteredMembers.length} of {members.length} team members
        </p>
      </motion.div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 mb-2">No members found</p>
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}