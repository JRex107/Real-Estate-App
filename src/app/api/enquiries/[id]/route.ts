import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/enquiries/[id] - Get a single enquiry
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            addressLine1: true,
            city: true,
            postcode: true,
            price: true,
            priceType: true,
            status: true,
          },
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Check enquiry belongs to user's agency
    if (enquiry.agencyId !== user.agencyId && user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(enquiry);
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 }
    );
  }
}

// PUT /api/enquiries/[id] - Update an enquiry (status, notes)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check enquiry belongs to user's agency
    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { id },
      select: { agencyId: true, status: true },
    });

    if (!existingEnquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (existingEnquiry.agencyId !== user.agencyId && user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.status) {
      updateData.status = body.status;

      // Set timestamps based on status change
      if (body.status === "RESPONDED" && existingEnquiry.status !== "RESPONDED") {
        updateData.respondedAt = new Date();
      }
      if (body.status === "CLOSED" && existingEnquiry.status !== "CLOSED") {
        updateData.closedAt = new Date();
      }
    }

    if (body.internalNotes !== undefined) {
      updateData.internalNotes = body.internalNotes;
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(enquiry);
  } catch (error) {
    console.error("Error updating enquiry:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry" },
      { status: 500 }
    );
  }
}

// DELETE /api/enquiries/[id] - Delete an enquiry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { id },
      select: { agencyId: true },
    });

    if (!existingEnquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (existingEnquiry.agencyId !== user.agencyId && user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.enquiry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete enquiry" },
      { status: 500 }
    );
  }
}
