import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/properties/[id]/images - Add images to a property
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check property belongs to user's agency
    const property = await prisma.property.findUnique({
      where: { id },
      select: { agencyId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.agencyId !== user.agencyId && user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Body can be a single image or array of images
    const images = Array.isArray(body) ? body : [body];

    // Get current max sort order
    const lastImage = await prisma.propertyImage.findFirst({
      where: { propertyId: id },
      orderBy: { sortOrder: "desc" },
    });

    let sortOrder = (lastImage?.sortOrder || 0) + 1;

    const createdImages = await Promise.all(
      images.map((img) =>
        prisma.propertyImage.create({
          data: {
            propertyId: id,
            url: img.url,
            altText: img.altText || null,
            caption: img.caption || null,
            sortOrder: sortOrder++,
            isPrimary: img.isPrimary || false,
          },
        })
      )
    );

    // If any image is marked as primary, unset other primaries
    const newPrimary = createdImages.find((img) => img.isPrimary);
    if (newPrimary) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: id,
          id: { not: newPrimary.id },
        },
        data: { isPrimary: false },
      });
    }

    return NextResponse.json(createdImages, { status: 201 });
  } catch (error) {
    console.error("Error adding images:", error);
    return NextResponse.json({ error: "Failed to add images" }, { status: 500 });
  }
}

// PUT /api/properties/[id]/images - Reorder images
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: { agencyId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.agencyId !== user.agencyId && user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    // Expect: { imageIds: string[] } where order is the new sort order

    const updates = body.imageIds.map((imageId: string, index: number) =>
      prisma.propertyImage.update({
        where: { id: imageId },
        data: { sortOrder: index },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering images:", error);
    return NextResponse.json(
      { error: "Failed to reorder images" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]/images - Delete an image (with imageId in body)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: { agencyId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.agencyId !== user.agencyId && user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId is required" },
        { status: 400 }
      );
    }

    await prisma.propertyImage.delete({
      where: { id: imageId },
    });

    // Note: Actual file deletion from storage would happen here
    // TODO: Integrate with storage provider (S3, Cloudinary, etc.)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
