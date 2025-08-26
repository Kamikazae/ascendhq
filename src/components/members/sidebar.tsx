"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  LogOut, 
  User,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Bell,
  Settings
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const navItems = [
  { 
    label: "Dashboard", 
    href: "/member/dashboard", 
    icon: LayoutDashboard,
    description: "Overview & progress",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100"
  },
  { 
    label: "My Objectives", 
    href: "/member/my-objectives", 
    icon: Target,
    description: "Track your goals",
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100"
  },
  { 
    label: "My Teams", 
    href: "/member/my-teams", 
    icon: Users,
    description: "Collaborate & connect",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100"
  },
];

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

interface SidebarProps {
  role: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ role, userName = "User", userEmail = "" }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const userRole = role || "Member";

  return (
    <aside 
      className={cn(
        "flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200 h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AscendHQ
                </h1>
                <p className="text-xs text-muted-foreground">Member Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="mb-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className={`h-12 w-12 ${getAvatarColor(userName)} text-white border-2 border-white shadow-md`}>
                <AvatarFallback className="font-medium">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  <User className="w-3 h-3 mr-1" />
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map(({ label, href, icon: Icon, description, color, bgColor, hoverColor }) => {
            const isActive = pathname === href;
            
            return (
              <div key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 relative overflow-hidden",
                    isActive 
                      ? `${bgColor} ${color} font-medium shadow-sm border border-gray-200` 
                      : `text-gray-700 ${hoverColor} hover:shadow-sm`,
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r" />
                  )}
                  
                  <Icon 
                    size={20} 
                    className={cn(
                      "transition-colors duration-200",
                      isActive ? color : "text-gray-500 group-hover:text-gray-700"
                    )} 
                  />
                  
                  {!isCollapsed && (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                      
                      <ChevronRight 
                        size={16} 
                        className={cn(
                          "transition-all duration-200",
                          isActive 
                            ? `${color} translate-x-1` 
                            : "text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1"
                        )} 
                      />
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Quick Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/60 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-600">--</div>
                <div className="text-xs text-muted-foreground">Objectives</div>
              </div>
              <div className="bg-white/60 rounded-lg p-2">
                <div className="text-lg font-bold text-green-600">--%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-gray-200 bg-white/50">
        {!isCollapsed && (
          <div className="space-y-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell size={16} />
              <span>Notifications</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                3
              </Badge>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Settings size={16} />
              <span>Settings</span>
            </Button>

            {/* Sign Out */}
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        )}

        {isCollapsed && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Settings size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full p-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <div
              style={{
                transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <ChevronRight size={16} />
            </div>
            {!isCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}