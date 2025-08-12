import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";

export async function requireRole(req, role) {
  const session = await getServerSession(req, authOptions);
  if (!session || session.user.role !== role) {
    return { authorized: false, session };
  }
  return { authorized: true, session };
}
