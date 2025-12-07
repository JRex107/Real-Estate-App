import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Home, MessageSquare } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalAgencies,
    activeAgencies,
    suspendedAgencies,
    totalUsers,
    totalProperties,
    totalEnquiries,
    recentAgencies,
  ] = await Promise.all([
    prisma.agency.count(),
    prisma.agency.count({ where: { status: "ACTIVE" } }),
    prisma.agency.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count(),
    prisma.property.count(),
    prisma.enquiry.count(),
    prisma.agency.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { properties: true, users: true },
        },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">
          Monitor and manage all agencies on the platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgencies}</div>
            <p className="text-xs text-muted-foreground">
              {activeAgencies} active, {suspendedAgencies} suspended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all agencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">Listed properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnquiries}</div>
            <p className="text-xs text-muted-foreground">All time enquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Agencies */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Agencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAgencies.map((agency) => (
              <div
                key={agency.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{agency.name}</p>
                  <p className="text-sm text-muted-foreground">{agency.email}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{agency._count.properties} properties</p>
                  <p>{agency._count.users} users</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
