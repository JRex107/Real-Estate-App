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
import { Search, Mail, Phone, ExternalLink } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { EnquiryWithProperty } from "@/types";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const fetchEnquiries = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      params.set("limit", "50");

      const response = await fetch(`/api/enquiries?${params.toString()}`);
      const data = await response.json();
      setEnquiries(data.data || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="default">New</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="warning">In Progress</Badge>;
      case "RESPONDED":
        return <Badge variant="success">Responded</Badge>;
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">
          Manage enquiries from potential buyers and tenants
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESPONDED">Responded</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries List */}
      <Card>
        <CardHeader>
          <CardTitle>{enquiries.length} Enquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : enquiries.length > 0 ? (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <Link
                  key={enquiry.id}
                  href={`/dashboard/enquiries/${enquiry.id}`}
                  className="block"
                >
                  <div className="rounded-lg border p-4 transition-colors hover:bg-muted">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{enquiry.name}</p>
                          {getStatusBadge(enquiry.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          Re: {enquiry.property.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {enquiry.message}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {enquiry.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {enquiry.email}
                            </span>
                          )}
                          {enquiry.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {enquiry.phone}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(enquiry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No enquiries found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
