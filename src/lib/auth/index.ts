import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import type { SessionUser } from "@/types";

/**
 * Get the current session on the server side
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get the current user from session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user as SessionUser | null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(
  role: "PLATFORM_ADMIN" | "AGENCY_ADMIN" | "AGENT"
): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is a platform admin
 */
export async function isPlatformAdmin(): Promise<boolean> {
  return hasRole("PLATFORM_ADMIN");
}

/**
 * Check if user is an agency admin
 */
export async function isAgencyAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "AGENCY_ADMIN" || user?.role === "PLATFORM_ADMIN";
}

/**
 * Check if user belongs to a specific agency
 */
export async function belongsToAgency(agencyId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.role === "PLATFORM_ADMIN") return true;
  return user.agencyId === agencyId;
}

export { authOptions };
