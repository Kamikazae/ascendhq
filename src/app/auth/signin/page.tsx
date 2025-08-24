"use client";

import { getCsrfToken, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      redirect: false,
    });

    if (res?.ok) {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (session?.user?.role === "MANAGER") {
        window.location.href = "/manager/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - App Info */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">AscendHQ</h1>
        <p className="text-lg mb-6 text-gray-100 max-w-md text-center">
          Manage your teams, set clear goals, and track OKRs effortlessly.
          Designed for managers and admins to keep everything aligned.
        </p>
        <ul className="space-y-3 text-gray-100 text-sm max-w-sm">
          <li>✅ Track objectives & key results</li>
          <li>✅ Monitor team performance</li>
          <li>✅ Simplify reporting & insights</li>
          <li>✅ Secure role-based access</li>
        </ul>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Sign in to AscendHQ
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="csrfToken" type="hidden" value={csrfToken} readOnly />
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
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
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
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
          <p className="mt-6 text-sm text-gray-500 text-center">
            Don’t have an account?{" "}
            <a href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
