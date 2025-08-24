import { Sidebar } from "@/components/members/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {isLoggedIn && <Sidebar role="Member" />}
        <main className={isLoggedIn ? "flex-1 p-4" : "w-full"}>
          {children}
        </main>
      </body>
    </html>
  );
}
