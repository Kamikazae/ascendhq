"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  User, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Target,
  Mail,
  Crown,
  UserCheck,
  Building2,
  TrendingUp,
  Eye,
  EyeOff,
  AlertCircle,
  Plus
} from "lucide-react";

// TypeScript interfaces matching the API response
interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamWithMembers {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  objectiveCount: number;
  members: TeamMemberData[];
}

interface MyTeamsResponse {
  teams: TeamWithMembers[];
}

// Role configuration for better display
const roleConfig = {
  LEAD: {
    label: "Team Lead",
    variant: "default" as const,
    icon: Crown,
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
    icon: UserCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
};

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

// Skeleton loading component
function TeamsSkeleton() {
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
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-12" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
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
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-20 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Enhanced team card component
function TeamCard({ team, index }: { team: TeamWithMembers; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort members by role (leads first, then members)
  const sortedMembers = useMemo(() => {
    return [...team.members].sort((a, b) => {
      const roleOrder = { LEAD: 0, ADMIN: 1, MEMBER: 2 };
      return (roleOrder[a.role as keyof typeof roleOrder] || 3) - 
             (roleOrder[b.role as keyof typeof roleOrder] || 3);
    });
  }, [team.members]);

  const teamLeads = sortedMembers.filter(member => member.role === 'LEAD');
  // const regularMembers = sortedMembers.filter(member => member.role !== 'LEAD');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-semibold line-clamp-2 mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {team.name}
              </CardTitle>
              {team.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {team.description}
                </p>
              )}
            </div>
            <Users className="h-6 w-6 text-blue-500 shrink-0" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Team Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-lg font-bold text-blue-600">{team.memberCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Objectives</p>
                <p className="text-lg font-bold text-green-600">{team.objectiveCount}</p>
              </div>
            </div>
          </div>

          {/* Team Leads Preview */}
          {teamLeads.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Team Lead{teamLeads.length > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                {teamLeads.slice(0, 2).map((lead) => (
                  <div key={lead.id} className="flex items-center gap-2 bg-yellow-50 px-2 py-1 rounded-full">
                    <Avatar className={`h-6 w-6 ${getAvatarColor(lead.name)} text-white text-xs`}>
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{lead.name.split(' ')[0]}</span>
                  </div>
                ))}
                {teamLeads.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{teamLeads.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Members Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Recent Members</p>
            <div className="flex items-center gap-1">
              {sortedMembers.slice(0, 5).map((member) => (
                <Avatar 
                  key={member.id} 
                  className={`h-8 w-8 ${getAvatarColor(member.name)} text-white border-2 border-white`}
                  title={`${member.name} (${roleConfig[member.role as keyof typeof roleConfig]?.label || member.role})`}
                >
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team.memberCount > 5 && (
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                  +{team.memberCount - 5}
                </div>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-center gap-2"
          >
            {isExpanded ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Details
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                View All Members
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Expandable Members List */}
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
                  <Users className="h-4 w-4" />
                  All Team Members ({team.memberCount})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sortedMembers.map((member, memberIndex) => {
                    const config = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.MEMBER;
                    const RoleIcon = config.icon;
                    
                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: memberIndex * 0.05 }}
                        className="flex items-center justify-between p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-10 w-10 ${getAvatarColor(member.name)} text-white`}>
                            <AvatarFallback className="text-sm font-medium">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <Badge variant={config.variant} className="flex items-center gap-1">
                          <RoleIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MyTeams() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/member/my-teams");

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          } else if (res.status === 403) {
            throw new Error("Access denied. Member permissions required.");
          } else if (res.status === 503) {
            throw new Error("Service temporarily unavailable. Please try again later.");
          } else {
            throw new Error("Failed to load teams data.");
          }
        }

        const data: MyTeamsResponse = await res.json();
        setTeams(data.teams);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members.some(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [teams, searchQuery]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const totalMembers = teams.reduce((sum, team) => sum + team.memberCount, 0);
    const totalObjectives = teams.reduce((sum, team) => sum + team.objectiveCount, 0);
    const avgTeamSize = totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0;

    return { totalTeams, totalMembers, totalObjectives, avgTeamSize };
  }, [teams]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <TeamsSkeleton />
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
            <Users className="h-8 w-8 text-blue-600" />
            My Teams
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

  // No teams state
  if (teams.length === 0) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            My Teams
          </h1>
        </motion.div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600 mb-4">You&apos;re not a member of any teams yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Join a Team
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
          <Users className="h-8 w-8 text-blue-600" />
          My Teams
        </h1>
        <p className="text-muted-foreground text-lg">
          Collaborate and track progress across your teams
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
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Objectives</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalObjectives}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Team Size</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgTeamSize}</p>
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
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams, members, or descriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}