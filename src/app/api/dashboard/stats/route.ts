import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agencyId = user.agencyId;

    // Run all queries in parallel
    const [
      totalProperties,
      forSale,
      toRent,
      available,
      underOffer,
      sold,
      letAgreed,
      totalEnquiries,
      newEnquiries,
      recentEnquiries,
    ] = await Promise.all([
      // Total properties
      prisma.property.count({ where: { agencyId } }),

      // For sale
      prisma.property.count({
        where: { agencyId, status: "FOR_SALE", isPublished: true },
      }),

      // To rent
      prisma.property.count({
        where: { agencyId, status: "TO_RENT", isPublished: true },
      }),

      // Available
      prisma.property.count({
        where: { agencyId, availabilityStatus: "AVAILABLE", isPublished: true },
      }),

      // Under offer
      prisma.property.count({
        where: { agencyId, availabilityStatus: "UNDER_OFFER" },
      }),

      // Sold
      prisma.property.count({
        where: { agencyId, availabilityStatus: "SOLD" },
      }),

      // Let agreed
      prisma.property.count({
        where: { agencyId, availabilityStatus: "LET_AGREED" },
      }),

      // Total enquiries
      prisma.enquiry.count({ where: { agencyId } }),

      // New enquiries
      prisma.enquiry.count({
        where: { agencyId, status: "NEW" },
      }),

      // Recent enquiries
      prisma.enquiry.findMany({
        where: { agencyId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true,
              addressLine1: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalProperties,
      forSale,
      toRent,
      available,
      underOffer,
      sold,
      letAgreed,
      totalEnquiries,
      newEnquiries,
      recentEnquiries,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
