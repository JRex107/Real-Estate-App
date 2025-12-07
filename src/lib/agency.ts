import prisma from "@/lib/prisma";
import type { AgencyBranding } from "@/types";

/**
 * Get agency branding by slug
 */
export async function getAgencyBySlug(slug: string): Promise<AgencyBranding | null> {
  const agency = await prisma.agency.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      heroImageUrl: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      email: true,
      phone: true,
      website: true,
      status: true,
    },
  });

  // Don't return suspended agencies
  if (!agency || agency.status === "SUSPENDED") {
    return null;
  }

  return agency;
}

/**
 * Get agency by ID
 */
export async function getAgencyById(id: string): Promise<AgencyBranding | null> {
  const agency = await prisma.agency.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      heroImageUrl: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      email: true,
      phone: true,
      website: true,
    },
  });

  return agency;
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const agency = await prisma.agency.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !agency;
}
