import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get user details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    const { id } = await params;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check access
    const isOwnProfile = currentUser.id === id;
    const isSameAgency = currentUser.agencyId === user.agencyId;
    const isAgencyAdmin = currentUser.role === "AGENCY_ADMIN" && isSameAgency;
    const isPlatformAdmin = currentUser.role === "PLATFORM_ADMIN";

    if (!isOwnProfile && !isAgencyAdmin && !isPlatformAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    const { id } = await params;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, agencyId: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check access
    const isOwnProfile = currentUser.id === id;
    const isSameAgency = currentUser.agencyId === targetUser.agencyId;
    const isAgencyAdmin = currentUser.role === "AGENCY_ADMIN" && isSameAgency;
    const isPlatformAdmin = currentUser.role === "PLATFORM_ADMIN";

    if (!isOwnProfile && !isAgencyAdmin && !isPlatformAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Users can update their own name
    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    // Users can update their own password
    if (body.password) {
      updateData.passwordHash = await bcrypt.hash(body.password, 12);
    }

    // Only admins can update role and isActive
    if (isAgencyAdmin || isPlatformAdmin) {
      if (body.role !== undefined && body.role !== "PLATFORM_ADMIN") {
        // Can't promote to platform admin
        updateData.role = body.role;
      }
      if (body.isActive !== undefined) {
        updateData.isActive = body.isActive;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete/deactivate user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    const { id } = await params;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, agencyId: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check access
    const isSameAgency = currentUser.agencyId === targetUser.agencyId;
    const isAgencyAdmin = currentUser.role === "AGENCY_ADMIN" && isSameAgency;
    const isPlatformAdmin = currentUser.role === "PLATFORM_ADMIN";

    if (!isAgencyAdmin && !isPlatformAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can't delete yourself
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Can't delete platform admins (unless you're also one)
    if (targetUser.role === "PLATFORM_ADMIN" && !isPlatformAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent && isPlatformAdmin) {
      await prisma.user.delete({ where: { id } });
    } else {
      // Soft delete - just deactivate
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
