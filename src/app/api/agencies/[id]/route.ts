import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/agencies/[id] - Get agency details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users can only view their own agency (except platform admins)
    if (user.role !== "PLATFORM_ADMIN" && user.agencyId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            properties: true,
            users: true,
            enquiries: true,
          },
        },
        officeLocations: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error("Error fetching agency:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency" },
      { status: 500 }
    );
  }
}

// PUT /api/agencies/[id] - Update agency settings
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only agency admins can update their agency (or platform admins)
    const isAgencyAdmin = user.role === "AGENCY_ADMIN" && user.agencyId === id;
    const isPlatformAdmin = user.role === "PLATFORM_ADMIN";

    if (!isAgencyAdmin && !isPlatformAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Build update data - only allow certain fields to be updated
    const allowedFields = [
      "name",
      "email",
      "phone",
      "website",
      "addressLine1",
      "addressLine2",
      "city",
      "county",
      "postcode",
      "logoUrl",
      "heroImageUrl",
      "primaryColor",
      "secondaryColor",
      "accentColor",
    ];

    // Platform admin can also update these
    const adminOnlyFields = ["status", "maxProperties", "planTier", "features"];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (isPlatformAdmin) {
      for (const field of adminOnlyFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
    }

    const agency = await prisma.agency.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(agency);
  } catch (error) {
    console.error("Error updating agency:", error);
    return NextResponse.json(
      { error: "Failed to update agency" },
      { status: 500 }
    );
  }
}

// DELETE /api/agencies/[id] - Delete/suspend agency (platform admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Permanently delete agency and all related data
      await prisma.agency.delete({ where: { id } });
    } else {
      // Soft delete - just suspend the agency
      await prisma.agency.update({
        where: { id },
        data: { status: "SUSPENDED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agency:", error);
    return NextResponse.json(
      { error: "Failed to delete agency" },
      { status: 500 }
    );
  }
}
