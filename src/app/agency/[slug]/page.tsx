import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { getAgencyBySlug } from "@/lib/agency";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { SearchFilters } from "@/components/property/search-filters";
import { Home, Key, ArrowRight } from "lucide-react";

interface AgencyHomePageProps {
  params: Promise<{ slug: string }>;
}

export default async function AgencyHomePage({ params }: AgencyHomePageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) {
    notFound();
  }

  // Fetch featured properties
  const featuredProperties = await prisma.property.findMany({
    where: {
      agency: { slug },
      isPublished: true,
      availabilityStatus: "AVAILABLE",
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  // Get counts
  const [forSaleCount, toRentCount] = await Promise.all([
    prisma.property.count({
      where: {
        agency: { slug },
        status: "FOR_SALE",
        isPublished: true,
        availabilityStatus: "AVAILABLE",
      },
    }),
    prisma.property.count({
      where: {
        agency: { slug },
        status: "TO_RENT",
        isPublished: true,
        availabilityStatus: "AVAILABLE",
      },
    }),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background">
        {agency.heroImageUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={agency.heroImageUrl}
              alt="Hero background"
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}
        <div className="container relative z-10 mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold">
            Find Your Perfect Property
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse our selection of properties for sale and rent.
            Your dream home is just a search away.
          </p>

          {/* Search Box */}
          <div className="mt-8 rounded-lg bg-background p-6 shadow-lg">
            <SearchFilters agencySlug={slug} />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link
              href={`/agency/${slug}/search?status=FOR_SALE`}
              className="flex items-center gap-4 rounded-lg border bg-background p-4 transition-shadow hover:shadow-md"
            >
              <Home className="h-10 w-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">{forSaleCount}</p>
                <p className="text-sm text-muted-foreground">For Sale</p>
              </div>
            </Link>

            <Link
              href={`/agency/${slug}/search?status=TO_RENT`}
              className="flex items-center gap-4 rounded-lg border bg-background p-4 transition-shadow hover:shadow-md"
            >
              <Key className="h-10 w-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">{toRentCount}</p>
                <p className="text-sm text-muted-foreground">To Rent</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Properties</h2>
              <Link
                href={`/agency/${slug}/search`}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  agencySlug={slug}
                />
              ))}
            </div>

            {featuredProperties.length >= 6 && (
              <div className="mt-8 text-center">
                <Link href={`/agency/${slug}/search`}>
                  <Button size="lg">View All Properties</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {featuredProperties.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold">No Properties Yet</h2>
            <p className="mt-4 text-muted-foreground">
              Check back soon for new listings from {agency.name}.
            </p>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Looking for Something Specific?</h2>
          <p className="mt-4 text-muted-foreground">
            Get in touch with our team and let us help you find your perfect property.
          </p>
          <Link href={`/agency/${slug}/contact`}>
            <Button size="lg" className="mt-6">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
