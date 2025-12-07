import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { userInviteSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { generateId } from "@/lib/utils";

// GET /api/users - List users for the current agency
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Platform admin can list all users
    if (user.role === "PLATFORM_ADMIN") {
      const { searchParams } = new URL(request.url);
      const agencyId = searchParams.get("agencyId");

      const users = await prisma.user.findMany({
        where: agencyId ? { agencyId } : {},
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          agency: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(users);
    }

    // Agency admins can only list their agency's users
    if (user.role !== "AGENCY_ADMIN" || !user.agencyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { agencyId: user.agencyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Invite a new user to the agency
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only agency admins can invite users (or platform admins)
    if (currentUser.role !== "AGENCY_ADMIN" && currentUser.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = userInviteSchema.parse(body);

    // Determine agency ID
    let agencyId = currentUser.agencyId;

    // Platform admin can specify agency
    if (currentUser.role === "PLATFORM_ADMIN" && body.agencyId) {
      agencyId = body.agencyId;
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: "Agency ID required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check agency user limit
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { maxUsers: true, _count: { select: { users: true } } },
    });

    if (agency && agency._count.users >= agency.maxUsers) {
      return NextResponse.json(
        { error: "User limit reached for this agency" },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = generateId(12);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        passwordHash,
        agencyId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // TODO: Send invitation email with temporary password
    // await sendInvitationEmail(newUser.email, tempPassword);

    return NextResponse.json(
      {
        ...newUser,
        // In development, return temp password (remove in production!)
        tempPassword: process.env.NODE_ENV === "development" ? tempPassword : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
