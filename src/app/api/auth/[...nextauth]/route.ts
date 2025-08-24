import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

// Central mapping for role-based landing pages
const ROLE_REDIRECTS = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  MEMBER: "/member/dashboard"
};

export const authOptions = {
  adapter: PrismaAdapter(prisma),
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
    async jwt({ token, user }: { token: any; user?: { role?: string } }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: { role?: string; sub?: string } }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ baseUrl, token }) {
      // token contains the role we added in jwt()
      const role = token?.role as keyof typeof ROLE_REDIRECTS | undefined;
      const path = role && role in ROLE_REDIRECTS ? ROLE_REDIRECTS[role] : "/";
      return `${baseUrl}${path}`;
    }
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
