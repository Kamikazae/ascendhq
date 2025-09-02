"use client";

import { getCsrfToken, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

import { motion } from "framer-motion";
import { 
  Crown, 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Target,
  Users,
  TrendingUp,
  Building2,
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";

// Role configuration for demo accounts
const demoAccounts = [
  {
    role: "Admin",
    email: "admin@example.com",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Full system access and user management"
  },
  {
    role: "Manager",
    email: "manager@manager.com", 
    icon: Shield,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Team leadership and objective oversight"
  },
  {
    role: "Member",
    email: "member1@example.com",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Personal objectives and team collaboration"
  }
];

const features = [
  {
    icon: Target,
    title: "Track Objectives & Key Results",
    description: "Set clear goals and monitor progress with visual indicators"
  },
  {
    icon: Users,
    title: "Team Performance Monitoring",
    description: "Real-time insights into team productivity and engagement"
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics & Reporting",
    description: "Comprehensive dashboards and performance metrics"
  },
  {
    icon: Building2,
    title: "Multi-Team Organization",
    description: "Manage multiple teams with role-based access control"
  }
];

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? ""));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
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
          window.location.href = "/member/dashboard";
        }
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - App Info & Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-lg"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold">AscendHQ</h1>
          </div>

          {/* Tagline */}
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Elevate your team&apos;s performance with intelligent objective tracking and seamless collaboration
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm"
              >
                <feature.icon className="w-6 h-6 text-blue-200 shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-blue-100">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Role-Based Access</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AscendHQ
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Demo Accounts */}
          <Card className="border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Try Demo Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoAccounts.map((account, index) => (
                <motion.button
                  key={account.role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleDemoLogin(account.email)}
                  className={`w-full p-2.5 rounded-lg border ${account.borderColor} ${account.bgColor} hover:shadow-sm transition-all duration-200 text-left group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <account.icon className={`w-4 h-4 ${account.color}`} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{account.role}</p>
                        <p className="text-xs text-gray-600">{account.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 text-gray-500 text-xs">Or sign in with your account</span>
            </div>
          </div>

          {/* Sign In Form */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="csrfToken" type="hidden" value={csrfToken} readOnly />
                
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <Button 
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium mt-6" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <a href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Contact your administrator
              </a>
            </p>
            
            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              <span>Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}