"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AgencyWithStats } from "@/types";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<AgencyWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const response = await fetch("/api/agencies?limit=100");
      const data = await response.json();
      setAgencies(data.data || []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspended</Badge>;
      case "PENDING_SETUP":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agencies</h1>
          <p className="text-muted-foreground">
            Manage all agencies on the platform
          </p>
        </div>
        <Link href="/admin/agencies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Agency
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{agencies.length} Agencies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : agencies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Agency</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Properties</th>
                    <th className="pb-3 font-medium">Users</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((agency) => (
                    <tr key={agency.id} className="border-b">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{agency.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {agency.slug}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">{getStatusBadge(agency.status)}</td>
                      <td className="py-4">
                        {agency._count.properties} / {agency.maxProperties}
                      </td>
                      <td className="py-4">
                        {agency._count.users} / {agency.maxUsers}
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="capitalize">
                          {agency.planTier}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {formatDate(agency.createdAt)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/agencies/${agency.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/agency/${agency.slug}`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No agencies yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
