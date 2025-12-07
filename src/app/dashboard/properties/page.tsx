"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { formatPrice, formatDate, getAvailabilityBadge } from "@/lib/utils";
import type { PropertyWithImages } from "@/types";

// Simple table component for this file
function SimpleTable({ children }: { children: React.ReactNode }) {
  return <table className="w-full">{children}</table>;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties?limit=100");
      const data = await response.json();
      setProperties(data.data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(search.toLowerCase()) ||
      property.addressLine1.toLowerCase().includes(search.toLowerCase()) ||
      property.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground">
            Manage your property listings
          </p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="FOR_SALE">For Sale</SelectItem>
                <SelectItem value="TO_RENT">To Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredProperties.length} Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : filteredProperties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Property</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Published</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => {
                    const { label, variant } = getAvailabilityBadge(
                      property.availabilityStatus
                    );
                    return (
                      <tr key={property.id} className="border-b">
                        <td className="py-4">
                          <div>
                            <p className="font-medium line-clamp-1">
                              {property.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {property.city}, {property.postcode}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          {formatPrice(property.price.toString(), property.priceType)}
                        </td>
                        <td className="py-4">
                          <Badge variant="outline">
                            {property.status === "FOR_SALE" ? "Sale" : "Rent"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant={variant}>{label}</Badge>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant={property.isPublished ? "success" : "secondary"}
                          >
                            {property.isPublished ? "Yes" : "Draft"}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {formatDate(property.createdAt)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/properties/${property.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No properties found</p>
              <Link href="/dashboard/properties/new">
                <Button className="mt-4">Add your first property</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
