import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { UserRole } from "../../types/auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        return isValid ? user : null;
      }
    })
  ],
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = user.role as UserRole;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role && token.id) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      // For redirect callback, we don't have access to token
      // The role-based redirect will be handled by middleware
      return baseUrl;
    }
  },
};