"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, UserCog, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
   { label: "Manage members", href: "/manager/members", icon: Users },
  { label: "Manage Objectives", href: "/manager/objectives", icon: UserCog },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const userRole = role || "Admin"; // mockdata for now

  return (
    <aside className="flex flex-col justify-between bg-white border-r w-64 h-screen p-4">
      {/* Top nav section */}
      <div>
        <h1 className="text-xl font-bold mb-8">AscendHQ</h1>
        <nav className="space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition",
                pathname === href && "bg-gray-200 font-medium"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="border-t pt-4 space-y-4">
        <div className="text-sm text-gray-500">
          Role: <span className="font-medium">{userRole}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
          onClick={() => signOut()}
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
