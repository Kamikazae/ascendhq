import { Sidebar } from "@/components/manager/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireAuth, requireManager } from "@/lib/auth-utils";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!requireAuth(session)) {
    redirect("/auth/signin");
  }

  // Redirect if not a manager
  if (!requireManager(session)) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        role="Manager" 
        userName={session.user.name || "Manager"}
        userEmail={session.user.email || ""}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
