// app/layout.tsx
import "./globals.css";
import {Sidebar} from "@/components/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  const isLoggedIn = !!session;

  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {isLoggedIn && <Sidebar role="ADMIN" />}
        <main className={isLoggedIn ? "flex-1 p-4" : "w-full"}>
          {children}
        </main>
      </body>
    </html>
  );
}
