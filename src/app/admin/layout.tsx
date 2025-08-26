import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { redirect } from "next/navigation";
import { requireAuth, requireAdmin } from "@/lib/auth-utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!requireAuth(session)) {
    redirect("/auth/signin");
  }

  // Redirect if not an admin
  if (!requireAdmin(session)) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        role="Admin" 
        userName={session.user.name || "Administrator"}
        userEmail={session.user.email || ""}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
