import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { propertySearchSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// GET /api/properties - Search and list properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate search parameters
    const params = propertySearchSchema.parse({
      status: searchParams.get("status") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      minBedrooms: searchParams.get("minBedrooms") || undefined,
      maxBedrooms: searchParams.get("maxBedrooms") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      keyword: searchParams.get("keyword") || undefined,
      city: searchParams.get("city") || undefined,
      postcode: searchParams.get("postcode") || undefined,
      agencySlug: searchParams.get("agencySlug") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 12,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      isPublished: true,
    };

    // Agency filter
    if (params.agencySlug) {
      where.agency = { slug: params.agencySlug, status: "ACTIVE" };
    } else {
      where.agency = { status: "ACTIVE" };
    }

    // Status filter (FOR_SALE / TO_RENT)
    if (params.status) {
      where.status = params.status;
    }

    // Price range
    if (params.minPrice || params.maxPrice) {
      where.price = {};
      if (params.minPrice) {
        where.price.gte = params.minPrice;
      }
      if (params.maxPrice) {
        where.price.lte = params.maxPrice;
      }
    }

    // Bedrooms
    if (params.minBedrooms) {
      where.bedrooms = { gte: params.minBedrooms };
    }
    if (params.maxBedrooms) {
      where.bedrooms = { ...where.bedrooms, lte: params.maxBedrooms };
    }

    // Property type
    if (params.propertyType && params.propertyType !== "all") {
      where.propertyType = params.propertyType as Prisma.EnumPropertyTypeFilter;
    }

    // Keyword search (title, address, description)
    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword, mode: "insensitive" } },
        { description: { contains: params.keyword, mode: "insensitive" } },
        { addressLine1: { contains: params.keyword, mode: "insensitive" } },
        { city: { contains: params.keyword, mode: "insensitive" } },
        { postcode: { contains: params.keyword, mode: "insensitive" } },
      ];
    }

    // City filter
    if (params.city) {
      where.city = { contains: params.city, mode: "insensitive" };
    }

    // Postcode filter
    if (params.postcode) {
      where.postcode = { startsWith: params.postcode.toUpperCase() };
    }

    // Count total for pagination
    const total = await prisma.property.count({ where });

    // Fetch properties
    const properties = await prisma.property.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 5,
        },
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
      orderBy: {
        [params.sortBy]: params.sortOrder,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    // Prepare map data (minimal data for markers)
    const mapData = properties.map((p) => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      price: Number(p.price),
      title: p.title,
      status: p.status,
    }));

    return NextResponse.json({
      data: properties,
      mapData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
        hasMore: params.page * params.limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Generate slug from title
    let slug = slugify(body.title);

    // Check if slug exists for this agency, append random string if so
    const existingProperty = await prisma.property.findUnique({
      where: {
        agencyId_slug: {
          agencyId: user.agencyId,
          slug,
        },
      },
    });

    if (existingProperty) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const property = await prisma.property.create({
      data: {
        ...body,
        slug,
        agencyId: user.agencyId,
        keyFeatures: body.keyFeatures || [],
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
