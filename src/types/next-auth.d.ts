import "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    agencyId: string | null;
    agencySlug: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      agencyId: string | null;
      agencySlug: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    agencyId: string | null;
    agencySlug: string | null;
  }
}
