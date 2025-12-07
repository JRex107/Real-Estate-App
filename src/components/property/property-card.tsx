"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, getAvailabilityBadge, getPropertyTypeLabel } from "@/lib/utils";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import type { PropertyWithImages } from "@/types";

interface PropertyCardProps {
  property: PropertyWithImages;
  agencySlug: string;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function PropertyCard({
  property,
  agencySlug,
  isHighlighted = false,
  onClick,
}: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  const { label: statusLabel, variant: statusVariant } = getAvailabilityBadge(
    property.availabilityStatus
  );

  return (
    <Link
      href={`/agency/${agencySlug}/property/${property.slug}`}
      onClick={onClick}
    >
      <Card
        className={`overflow-hidden transition-all hover:shadow-lg ${
          isHighlighted ? "ring-2 ring-primary shadow-lg" : ""
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || property.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute left-2 top-2">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>

          {/* Sale/Rent Badge */}
          <div className="absolute right-2 top-2">
            <Badge variant={property.status === "FOR_SALE" ? "default" : "secondary"}>
              {property.status === "FOR_SALE" ? "For Sale" : "To Rent"}
            </Badge>
          </div>

          {/* Featured Badge */}
          {property.isFeatured && (
            <div className="absolute left-2 bottom-2">
              <Badge variant="warning">Featured</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Price */}
          <p className="text-xl font-bold text-primary">
            {formatPrice(property.price.toString(), property.priceType)}
          </p>

          {/* Title */}
          <h3 className="mt-1 font-semibold line-clamp-1">{property.title}</h3>

          {/* Address */}
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {property.addressLine1}, {property.city}
            </span>
          </p>

          {/* Features */}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {property.bathrooms}
              </span>
            )}
            {property.floorAreaSqFt && (
              <span className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                {property.floorAreaSqFt} sq ft
              </span>
            )}
          </div>

          {/* Property Type */}
          <p className="mt-2 text-xs text-muted-foreground">
            {getPropertyTypeLabel(property.propertyType)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <CardContent className="p-4">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-full animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-3 flex gap-4">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
