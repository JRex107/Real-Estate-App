import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { formatPrice, getAvailabilityBadge, getPropertyTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Home,
  Car,
  Flower2,
  Thermometer,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const PropertyDetailMap = dynamic(
  () => import("@/components/map/property-detail-map").then((mod) => mod.PropertyDetailMap),
  { ssr: false }
);

interface PropertyPageProps {
  params: Promise<{ slug: string; propertySlug: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug, propertySlug } = await params;

  const property = await prisma.property.findFirst({
    where: {
      slug: propertySlug,
      agency: { slug },
      isPublished: true,
    },
    select: {
      title: true,
      description: true,
      price: true,
      priceType: true,
      images: { take: 1 },
    },
  });

  if (!property) {
    return { title: "Property Not Found" };
  }

  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.images[0]?.url ? [property.images[0].url] : [],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug, propertySlug } = await params;

  const property = await prisma.property.findFirst({
    where: {
      slug: propertySlug,
      agency: { slug },
      isPublished: true,
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      agency: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const { label: statusLabel, variant: statusVariant } = getAvailabilityBadge(
    property.availabilityStatus
  );
  const keyFeatures = (property.keyFeatures as string[]) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="overflow-hidden rounded-lg">
            {property.images.length > 0 ? (
              <div className="grid gap-2">
                {/* Main Image */}
                <div className="relative aspect-[16/10]">
                  <Image
                    src={property.images[0].url}
                    alt={property.images[0].altText || property.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                    <Badge
                      variant={property.status === "FOR_SALE" ? "default" : "secondary"}
                    >
                      {property.status === "FOR_SALE" ? "For Sale" : "To Rent"}
                    </Badge>
                  </div>
                </div>

                {/* Thumbnail Grid */}
                {property.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {property.images.slice(1, 5).map((image, index) => (
                      <div key={image.id} className="relative aspect-[4/3]">
                        <Image
                          src={image.url}
                          alt={image.altText || `Image ${index + 2}`}
                          fill
                          className="rounded object-cover"
                        />
                        {index === 3 && property.images.length > 5 && (
                          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-white">
                            +{property.images.length - 5} more
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                <span className="text-muted-foreground">No images available</span>
              </div>
            )}
          </div>

          {/* Price & Title */}
          <div className="mt-6">
            <p className="text-3xl font-bold text-primary">
              {formatPrice(property.price.toString(), property.priceType)}
            </p>
            <h1 className="mt-2 text-2xl font-bold">{property.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {property.addressLine1}, {property.city}, {property.postcode}
            </p>
          </div>

          {/* Key Features */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{property.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                </div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{property.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                </div>
              </div>
            )}
            {property.floorAreaSqFt && (
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{property.floorAreaSqFt}</p>
                  <p className="text-xs text-muted-foreground">Sq Ft</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{getPropertyTypeLabel(property.propertyType)}</p>
                <p className="text-xs text-muted-foreground">Type</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">Description</h2>
            <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
              {property.description}
            </div>
          </div>

          {/* Key Features List */}
          {keyFeatures.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Key Features</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Property Details */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">Property Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded border p-3">
                <span className="text-muted-foreground">Property Type</span>
                <span className="font-medium">{getPropertyTypeLabel(property.propertyType)}</span>
              </div>
              {property.tenure !== "NOT_SPECIFIED" && (
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-muted-foreground">Tenure</span>
                  <span className="font-medium capitalize">
                    {property.tenure?.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              )}
              {property.epcRating !== "NOT_SPECIFIED" && (
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-muted-foreground">EPC Rating</span>
                  <span className="font-medium">{property.epcRating}</span>
                </div>
              )}
              {property.councilTaxBand && (
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-muted-foreground">Council Tax</span>
                  <span className="font-medium">Band {property.councilTaxBand}</span>
                </div>
              )}
              <div className="flex items-center justify-between rounded border p-3">
                <span className="text-muted-foreground">Receptions</span>
                <span className="font-medium">{property.receptions}</span>
              </div>
              {property.parkingSpaces > 0 && (
                <div className="flex items-center justify-between rounded border p-3">
                  <span className="text-muted-foreground">Parking</span>
                  <span className="font-medium">{property.parkingSpaces} spaces</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="mt-4 flex flex-wrap gap-2">
              {property.hasGarden && (
                <Badge variant="outline" className="gap-1">
                  <Flower2 className="h-3 w-3" /> Garden
                </Badge>
              )}
              {property.hasGarage && (
                <Badge variant="outline" className="gap-1">
                  <Car className="h-3 w-3" /> Garage
                </Badge>
              )}
              {property.hasParking && (
                <Badge variant="outline" className="gap-1">
                  <Car className="h-3 w-3" /> Parking
                </Badge>
              )}
              {property.hasCentralHeating && (
                <Badge variant="outline" className="gap-1">
                  <Thermometer className="h-3 w-3" /> Central Heating
                </Badge>
              )}
              {property.hasDoubleGlazing && (
                <Badge variant="outline">Double Glazing</Badge>
              )}
              {property.petsAllowed && (
                <Badge variant="outline">Pets Allowed</Badge>
              )}
            </div>
          </div>

          {/* Location Map */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">Location</h2>
            <div className="mt-4 h-[300px] overflow-hidden rounded-lg border">
              <PropertyDetailMap
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enquiry Form */}
          <EnquiryForm propertyId={property.id} propertyTitle={property.title} />

          {/* Agency Card */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {property.agency.logoUrl ? (
                <Image
                  src={property.agency.logoUrl}
                  alt={property.agency.name}
                  width={48}
                  height={48}
                  className="rounded"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-primary text-lg font-bold text-primary-foreground">
                  {property.agency.name[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">{property.agency.name}</p>
                <p className="text-sm text-muted-foreground">Estate Agent</p>
              </div>
            </div>
            {property.agency.phone && (
              <a
                href={`tel:${property.agency.phone}`}
                className="mt-4 block w-full rounded-md bg-primary py-2 text-center text-primary-foreground hover:bg-primary/90"
              >
                Call {property.agency.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
