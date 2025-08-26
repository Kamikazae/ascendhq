"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Settings, 
  Search, 
  UserCog, 
  Shield,
  Users,
  Crown,
  User,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  AlertCircle,
  Save,
  RefreshCw
} from "lucide-react";

// TypeScript interfaces
interface UserRole {
  id: string;
  name: string;
  email: string;
  currentRole: "ADMIN" | "MANAGER" | "MEMBER";
  proposedRole?: "ADMIN" | "MANAGER" | "MEMBER";
  teamName?: string;
  joinedDate: string;
  lastActive: string;
  canPromote: boolean;
  canDemote: boolean;
}

interface RoleChange {
  userId: string;
  userName: string;
  fromRole: string;
  toRole: string;
  reason?: string;
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
  ADMIN: {
    label: "Admin",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    variant: "destructive" as const
  },
  MANAGER: {
    label: "Manager",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    variant: "default" as const
  },
  MEMBER: {
    label: "Member",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    variant: "secondary" as const
  }
};

// User role card component
function UserRoleCard({ user, index, onRoleChange }: { 
  user: UserRole; 
  index: number; 
  onRoleChange: (userId: string, newRole: "ADMIN" | "MANAGER" | "MEMBER") => void;
}) {
  const currentRoleConf = roleConfig[user.currentRole];
  const proposedRoleConf = user.proposedRole ? roleConfig[user.proposedRole] : null;
  const CurrentRoleIcon = currentRoleConf.icon;
  // const ProposedRoleIcon = proposedRoleConf?.icon;

  const handlePromote = () => {
    if (user.currentRole === "MEMBER") {
      onRoleChange(user.id, "MANAGER");
    } else if (user.currentRole === "MANAGER") {
      onRoleChange(user.id, "ADMIN");
    }
  };

  const handleDemote = () => {
    if (user.currentRole === "ADMIN") {
      onRoleChange(user.id, "MANAGER");
    } else if (user.currentRole === "MANAGER") {
      onRoleChange(user.id, "MEMBER");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${currentRoleConf.borderColor} ${currentRoleConf.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className={`h-12 w-12 ${getAvatarColor(user.name)} text-white border-2 border-white shadow-md`}>
                <AvatarFallback className="font-medium text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                {user.teamName && (
                  <p className="text-xs text-muted-foreground mt-1">Team: {user.teamName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={currentRoleConf.variant} className={`${currentRoleConf.bgColor} flex items-center gap-1`}>
                <CurrentRoleIcon className="h-3 w-3" />
                {currentRoleConf.label}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Role Change Preview */}
          {user.proposedRole && user.proposedRole !== user.currentRole && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Pending Role Change</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currentRoleConf.label}
                  </Badge>
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                  <Badge variant="outline" className="text-xs">
                    {proposedRoleConf?.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p className="font-medium">{new Date(user.joinedDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Active</p>
              <p className="font-medium">{new Date(user.lastActive).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Role Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={handlePromote}
              disabled={!user.canPromote}
            >
              <ArrowUp className="h-4 w-4" />
              Promote
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={handleDemote}
              disabled={!user.canDemote}
            >
              <ArrowDown className="h-4 w-4" />
              Demote
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SystemSettingsPage() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [pendingChanges, setPendingChanges] = useState<RoleChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/system-settings/users");
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          } else if (res.status === 403) {
            throw new Error("Admin access required.");
          } else {
            throw new Error("Failed to load users data.");
          }
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = (userId: string, newRole: "ADMIN" | "MANAGER" | "MEMBER") => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          const change: RoleChange = {
            userId,
            userName: user.name,
            fromRole: user.currentRole,
            toRole: newRole
          };
          
          // Add to pending changes if not already there
          setPendingChanges(prev => {
            const existing = prev.find(c => c.userId === userId);
            if (existing) {
              return prev.map(c => c.userId === userId ? change : c);
            }
            return [...prev, change];
          });

          return {
            ...user,
            proposedRole: newRole
          };
        }
        return user;
      })
    );
  };

  // Save all pending changes
  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/system-settings/role-changes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ changes: pendingChanges })
      });

      if (!res.ok) {
        throw new Error("Failed to save role changes");
      }

      // Update users with new roles
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          currentRole: user.proposedRole || user.currentRole,
          proposedRole: undefined
        }))
      );

      setPendingChanges([]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Cancel pending changes
  const handleCancelChanges = () => {
    setUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        proposedRole: undefined
      }))
    );
    setPendingChanges([]);
  };

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                           user.email.toLowerCase().includes(search.toLowerCase()) ||
                           (user.teamName || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.currentRole === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.currentRole === "ADMIN").length;
    const managerCount = users.filter(u => u.currentRole === "MANAGER").length;
    const memberCount = users.filter(u => u.currentRole === "MEMBER").length;
    const pendingChangesCount = pendingChanges.length;

    return { totalUsers, adminCount, managerCount, memberCount, pendingChangesCount };
  }, [users, pendingChanges]);

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
              <p className="text-lg text-red-600 mb-2">Error loading system settings</p>
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
          <Settings className="h-8 w-8 text-gray-600" />
          System Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage user roles and system permissions
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
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-red-600">{stats.adminCount}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.managerCount}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-2xl font-bold text-green-600">{stats.memberCount}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Changes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingChangesCount}</p>
              </div>
              <UserCog className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Changes Alert */}
      {pendingChanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">
                      {pendingChanges.length} pending role change{pendingChanges.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-orange-600">
                      Review and save changes to apply them to the system
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelChanges}>
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
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
              placeholder="Search users by name, email, or team..."
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
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </motion.div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user, index) => (
            <UserRoleCard 
              key={user.id} 
              user={user} 
              index={index} 
              onRoleChange={handleRoleChange}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 mb-2">No users found</p>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}