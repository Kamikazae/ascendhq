"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Building2,
  UserCheck,
  Clock,
  TrendingUp,
  User,
  MoreHorizontal,
  AlertCircle
} from "lucide-react";

// TypeScript interfaces
interface Member {
  id: number;
  name: string;
  email: string;
  role: "Manager" | "Member" | "Admin";
  status: "Active" | "Pending" | "Inactive";
  team?: string;
  joinedDate?: string;
  lastActive?: string;
  contributions?: number;
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
const roleConfig: Record<string, {
  variant: "destructive" | "default" | "secondary";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  Admin: {
    variant: "destructive" as const,
    icon: UserCheck,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  Manager: {
    variant: "default" as const,
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  Member: {
    variant: "secondary" as const,
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  }
};

// Status configuration
const statusConfig: Record<string, {
  variant: "destructive" | "default" | "secondary";
  color: string;
  bgColor: string;
}> = {
  Active: {
    variant: "default" as const,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  Pending: {
    variant: "secondary" as const,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  Inactive: {
    variant: "secondary" as const,
    color: "text-gray-600",
    bgColor: "bg-gray-50"
  }
};

// Enhanced member card component
function MemberCard({ member, index }: { member: Member; index: number }) {
  const roleConf = roleConfig[member.role] || roleConfig.Member; // Fallback to Member if role not found
  const statusConf = statusConfig[member.status] || statusConfig.Active; // Fallback to Active if status not found
  const RoleIcon = roleConf?.icon || User; // Fallback to User icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${roleConf.borderColor} ${roleConf.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className={`h-12 w-12 ${getAvatarColor(member.name)} text-white border-2 border-white shadow-md`}>
                <AvatarFallback className="font-medium text-white">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate">{member.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusConf.variant} className={statusConf.bgColor}>
                {member.status}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Role and Team Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <RoleIcon className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{member.role}</p>
                <p className="text-xs text-muted-foreground">System Role</p>
              </div>
            </div>

            {member.team && (
              <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
                <Building2 className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.team}</p>
                  <p className="text-xs text-muted-foreground">Team Assignment</p>
                </div>
              </div>
            )}
          </div>

          {/* Member Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Contributions</p>
                <p className="text-lg font-bold text-green-600">{member.contributions || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Last Active</p>
                <p className="text-xs font-medium text-orange-600">
                  {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Join Date */}
          {member.joinedDate && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Joined {new Date(member.joinedDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ManageMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/admin/manage-members");
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          } else if (res.status === 403) {
            throw new Error("Access denied. Administrator permissions required.");
          } else if (res.status === 503) {
            throw new Error("Service temporarily unavailable. Please try again later.");
          } else {
            throw new Error("Failed to load member data.");
          }
        }

        const data = await res.json();
        console.log("Raw API response:", data);
        
        // Transform API data to match frontend interface
        const transformedMembers: Member[] = data.map((member: {
          id: string | number;
          name: string;
          email: string;
          team: string;
          role: string;
          status: string;
          joinedDate: string;
          lastActive: string;
          contributions: number;
        }) => {
          // Map API role values to frontend expected values
          let role: "Manager" | "Member" | "Admin" = "Member"; // Default fallback
          if (member.role === "MANAGER") role = "Manager";
          else if (member.role === "ADMIN") role = "Admin";
          else if (member.role === "MEMBER") role = "Member";
          
          return {
            id: parseInt(member.id.toString()) || 0,
            name: member.name,
            email: member.email,
            role,
            status: member.status as "Active" | "Pending" | "Inactive",
            team: member.team,
            joinedDate: member.joinedDate,
            lastActive: member.lastActive,
            contributions: member.contributions
          };
        });
        console.log("Transformed members:", transformedMembers);
        setMembers(transformedMembers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                           member.email.toLowerCase().includes(search.toLowerCase()) ||
                           (member.team || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === "Active").length;
    const pendingMembers = members.filter(m => m.status === "Pending").length;
    const totalContributions = members.reduce((sum, m) => sum + (m.contributions || 0), 0);

    return { totalMembers, activeMembers, pendingMembers, totalContributions };
  }, [members]);

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
                <div className="h-32 bg-gray-200 rounded" />
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
            <Users className="h-8 w-8 text-blue-600" />
            Manage Members
          </h1>
        </motion.div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg text-red-600 mb-2">Error loading members</p>
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
          <Users className="h-8 w-8 text-blue-600" />
          Manage Members
        </h1>
        <p className="text-muted-foreground text-lg">
          Administer user accounts and manage system access
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
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingMembers}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
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
              <TrendingUp className="h-8 w-8 text-purple-500" />
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
              placeholder="Search members by name, email, or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Member">Member</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
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
          Showing {filteredMembers.length} of {members.length} members
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
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}