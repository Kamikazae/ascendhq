import { Sidebar } from "@/components/members/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireAuth, requireMember } from "@/lib/auth-utils";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!requireAuth(session)) {
    redirect("/auth/signin");
  }

  // Redirect if not a member
  if (!requireMember(session)) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        role="Member" 
        userName={session.user.name || "User"}
        userEmail={session.user.email || ""}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
