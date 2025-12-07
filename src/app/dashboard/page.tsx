import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Home,
  Key,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatRelativeTime, formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.agencyId) {
    redirect("/login");
  }

  const agencyId = session.user.agencyId;

  // Fetch dashboard stats
  const [
    totalProperties,
    forSale,
    toRent,
    available,
    underOffer,
    newEnquiries,
    recentEnquiries,
    recentProperties,
  ] = await Promise.all([
    prisma.property.count({ where: { agencyId } }),
    prisma.property.count({ where: { agencyId, status: "FOR_SALE", isPublished: true } }),
    prisma.property.count({ where: { agencyId, status: "TO_RENT", isPublished: true } }),
    prisma.property.count({ where: { agencyId, availabilityStatus: "AVAILABLE", isPublished: true } }),
    prisma.property.count({ where: { agencyId, availabilityStatus: "UNDER_OFFER" } }),
    prisma.enquiry.count({ where: { agencyId, status: "NEW" } }),
    prisma.enquiry.findMany({
      where: { agencyId },
      include: {
        property: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.property.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        availabilityStatus: true,
        price: true,
        priceType: true,
        isPublished: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your properties.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {available} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">For Sale</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forSale}</div>
            <p className="text-xs text-muted-foreground">Published listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">To Rent</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toRent}</div>
            <p className="text-xs text-muted-foreground">Published listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newEnquiries}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Under Offer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underOffer}</div>
            <p className="text-xs text-muted-foreground">Properties under offer</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Enquiries</CardTitle>
            <Link href="/dashboard/enquiries">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentEnquiries.length > 0 ? (
              <div className="space-y-4">
                {recentEnquiries.map((enquiry) => (
                  <Link
                    key={enquiry.id}
                    href={`/dashboard/enquiries/${enquiry.id}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted">
                      <div>
                        <p className="font-medium">{enquiry.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {enquiry.property.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={enquiry.status === "NEW" ? "default" : "secondary"}
                        >
                          {enquiry.status}
                        </Badge>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatRelativeTime(enquiry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No enquiries yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Properties</CardTitle>
            <Link href="/dashboard/properties">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentProperties.length > 0 ? (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/dashboard/properties/${property.id}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted">
                      <div>
                        <p className="font-medium line-clamp-1">{property.title}</p>
                        <p className="text-sm text-primary">
                          {formatPrice(property.price.toString(), property.priceType)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={property.isPublished ? "success" : "secondary"}
                        >
                          {property.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(property.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">No properties yet</p>
                <Link href="/dashboard/properties/new">
                  <Button className="mt-4">Add your first property</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
