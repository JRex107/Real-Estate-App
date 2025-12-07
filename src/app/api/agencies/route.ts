import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAgencySchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

// GET /api/agencies - List all agencies (platform admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [agencies, total] = await Promise.all([
      prisma.agency.findMany({
        where,
        include: {
          _count: {
            select: {
              properties: true,
              users: true,
              enquiries: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.agency.count({ where }),
    ]);

    return NextResponse.json({
      data: agencies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch agencies" },
      { status: 500 }
    );
  }
}

// POST /api/agencies - Create a new agency (platform admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAgencySchema.parse(body);

    // Check if slug is available
    const existingAgency = await prisma.agency.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingAgency) {
      return NextResponse.json(
        { error: "Agency slug already exists" },
        { status: 400 }
      );
    }

    // Check if admin email is available
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Admin email already registered" },
        { status: 400 }
      );
    }

    // Hash admin password
    const passwordHash = await bcrypt.hash(validatedData.adminPassword, 12);

    // Create agency and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create agency
      const agency = await tx.agency.create({
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          email: validatedData.email,
          phone: validatedData.phone || null,
          maxProperties: validatedData.maxProperties,
          planTier: validatedData.planTier,
          status: "ACTIVE",
        },
      });

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: validatedData.adminEmail,
          name: validatedData.adminName,
          passwordHash,
          role: "AGENCY_ADMIN",
          agencyId: agency.id,
          isActive: true,
        },
      });

      return { agency, adminUser };
    });

    return NextResponse.json(result.agency, { status: 201 });
  } catch (error) {
    console.error("Error creating agency:", error);
    return NextResponse.json(
      { error: "Failed to create agency" },
      { status: 500 }
    );
  }
}
