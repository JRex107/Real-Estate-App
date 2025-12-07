"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAgency } from "@/contexts/agency-context";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/property-card";
import { SearchFilters } from "@/components/property/search-filters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { PropertyWithImages, PropertySearchResponse } from "@/types";

// Dynamic import for map to avoid SSR issues
const PropertyMap = dynamic(
  () => import("@/components/map/property-map").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

function SearchPageContent() {
  const { agency } = useAgency();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [mapData, setMapData] = useState<
    { id: string; latitude: number; longitude: number; price: number; title: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<"list" | "map">("list");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    if (!agency) return;

    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("agencySlug", agency.slug);
      params.set("page", page.toString());
      params.set("limit", "12");

      const response = await fetch(`/api/properties?${params.toString()}`);
      const data: PropertySearchResponse = await response.json();

      setProperties(data.data);
      setMapData(data.mapData);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }, [agency, searchParams, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const status = searchParams.get("status") || "FOR_SALE";
  const statusLabel = status === "FOR_SALE" ? "For Sale" : "To Rent";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Filters */}
      <div className="mb-8">
        <SearchFilters agencySlug={agency?.slug || ""} />
      </div>

      {/* Results Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties {statusLabel}</h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? "property" : "properties"} found
          </p>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results */}
      <Tabs value={view} className="space-y-6">
        {/* List View */}
        <TabsContent value="list" className="mt-0">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    agencySlug={agency?.slug || ""}
                    isHighlighted={highlightedId === property.id}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg font-medium">No properties found</p>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search filters
              </p>
            </div>
          )}
        </TabsContent>

        {/* Map View */}
        <TabsContent value="map" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Map */}
            <div className="h-[500px] overflow-hidden rounded-lg border lg:h-[calc(100vh-300px)]">
              <PropertyMap
                markers={mapData}
                onMarkerClick={(id) => setHighlightedId(id)}
                highlightedId={highlightedId}
              />
            </div>

            {/* Property List */}
            <div className="custom-scrollbar max-h-[500px] space-y-4 overflow-y-auto lg:max-h-[calc(100vh-300px)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))
              ) : properties.length > 0 ? (
                properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    agencySlug={agency?.slug || ""}
                    isHighlighted={highlightedId === property.id}
                    onClick={() => setHighlightedId(property.id)}
                  />
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No properties found</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
