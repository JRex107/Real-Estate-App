import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enquiryFormSchema } from "@/lib/validations";

// GET /api/enquiries - List enquiries (for authenticated agency users)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {
      agencyId: user.agencyId,
    };

    if (status) {
      where.status = status;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enquiry.count({ where }),
    ]);

    return NextResponse.json({
      data: enquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

// POST /api/enquiries - Create a new enquiry (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = enquiryFormSchema.parse(body);

    // Get property and agency
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
      select: {
        id: true,
        agencyId: true,
        agency: {
          select: { status: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.agency.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Agency is not accepting enquiries" },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId: validatedData.propertyId,
        agencyId: property.agencyId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
        source: "website",
      },
    });

    // TODO: Send notification email to agency
    // await sendEnquiryNotification(enquiry, property);

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json(
      { error: "Failed to create enquiry" },
      { status: 500 }
    );
  }
}
