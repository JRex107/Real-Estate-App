"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
import { buildSearchParams, debounce } from "@/lib/utils";

interface SearchFiltersProps {
  agencySlug: string;
  className?: string;
}

const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House" },
  { value: "FLAT", label: "Flat" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "BUNGALOW", label: "Bungalow" },
  { value: "DETACHED", label: "Detached" },
  { value: "SEMI_DETACHED", label: "Semi-Detached" },
  { value: "TERRACED", label: "Terraced" },
  { value: "END_TERRACE", label: "End Terrace" },
  { value: "COTTAGE", label: "Cottage" },
  { value: "STUDIO", label: "Studio" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
];

const PRICE_RANGES_SALE = [
  { value: "", label: "Any" },
  { value: "50000", label: "50,000" },
  { value: "100000", label: "100,000" },
  { value: "150000", label: "150,000" },
  { value: "200000", label: "200,000" },
  { value: "250000", label: "250,000" },
  { value: "300000", label: "300,000" },
  { value: "400000", label: "400,000" },
  { value: "500000", label: "500,000" },
  { value: "750000", label: "750,000" },
  { value: "1000000", label: "1,000,000" },
  { value: "2000000", label: "2,000,000" },
];

const PRICE_RANGES_RENT = [
  { value: "", label: "Any" },
  { value: "500", label: "500" },
  { value: "750", label: "750" },
  { value: "1000", label: "1,000" },
  { value: "1250", label: "1,250" },
  { value: "1500", label: "1,500" },
  { value: "2000", label: "2,000" },
  { value: "2500", label: "2,500" },
  { value: "3000", label: "3,000" },
  { value: "5000", label: "5,000" },
];

const BEDROOMS = [
  { value: "", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

export function SearchFilters({ agencySlug, className }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "FOR_SALE");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("city") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );
  const [minBedrooms, setMinBedrooms] = useState(
    searchParams.get("minBedrooms") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const priceRanges = status === "FOR_SALE" ? PRICE_RANGES_SALE : PRICE_RANGES_RENT;

  const applyFilters = useCallback(() => {
    const params = buildSearchParams({
      status,
      keyword: keyword || undefined,
      city: location || undefined,
      propertyType: propertyType || undefined,
      minBedrooms: minBedrooms || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });

    router.push(`/agency/${agencySlug}/search?${params.toString()}`);
  }, [
    status,
    keyword,
    location,
    propertyType,
    minBedrooms,
    minPrice,
    maxPrice,
    agencySlug,
    router,
  ]);

  const clearFilters = () => {
    setKeyword("");
    setLocation("");
    setPropertyType("");
    setMinBedrooms("");
    setMinPrice("");
    setMaxPrice("");
    router.push(`/agency/${agencySlug}/search?status=${status}`);
  };

  // Debounced search for keyword
  const debouncedApply = useCallback(debounce(applyFilters, 300), [applyFilters]);

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    debouncedApply();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Buy/Rent Toggle */}
      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          // Reset price when switching
          setMinPrice("");
          setMaxPrice("");
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="FOR_SALE">For Sale</TabsTrigger>
          <TabsTrigger value="TO_RENT">To Rent</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by keyword..."
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          placeholder="City or postcode"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
        <div>
          <Label htmlFor="propertyType" className="sr-only">
            Property Type
          </Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger id="propertyType">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Type</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="minBedrooms" className="sr-only">
            Bedrooms
          </Label>
          <Select value={minBedrooms} onValueChange={setMinBedrooms}>
            <SelectTrigger id="minBedrooms">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              {BEDROOMS.map((bed) => (
                <SelectItem key={bed.value || "any"} value={bed.value || "any"}>
                  {bed.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="minPrice" className="sr-only">
            Min Price
          </Label>
          <Select value={minPrice} onValueChange={setMinPrice}>
            <SelectTrigger id="minPrice">
              <SelectValue placeholder="Min Price" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((price) => (
                <SelectItem key={price.value || "any"} value={price.value || "any"}>
                  {price.value ? `£${price.label}` : "No min"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="maxPrice" className="sr-only">
            Max Price
          </Label>
          <Select value={maxPrice} onValueChange={setMaxPrice}>
            <SelectTrigger id="maxPrice">
              <SelectValue placeholder="Max Price" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((price) => (
                <SelectItem key={price.value || "any"} value={price.value || "any"}>
                  {price.value ? `£${price.label}` : "No max"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex gap-2 sm:col-span-1">
          <Button onClick={applyFilters} className="flex-1">
            Search
          </Button>
          <Button variant="outline" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
