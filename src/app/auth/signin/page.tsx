"use client";

import { getCsrfToken, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState<string | undefined>("");

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? ""));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // <-- disable auto redirect so we can handle it
    });

    if (res?.ok) {
      // Fetch session to know role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (session?.user?.role === "MANAGER") {
        window.location.href = "/manager/dashboard";
      } else {
        window.location.href = "/dashboard"; // fallback
      }
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Sign in to Team OKR
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="csrfToken" type="hidden" value={csrfToken} readOnly />
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
