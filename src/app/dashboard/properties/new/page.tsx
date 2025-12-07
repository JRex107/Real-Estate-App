"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { propertyFormSchema, type PropertyFormValues } from "@/lib/validations";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House" },
  { value: "FLAT", label: "Flat" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "BUNGALOW", label: "Bungalow" },
  { value: "DETACHED", label: "Detached" },
  { value: "SEMI_DETACHED", label: "Semi-Detached" },
  { value: "TERRACED", label: "Terraced" },
  { value: "COTTAGE", label: "Cottage" },
  { value: "STUDIO", label: "Studio" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      status: "FOR_SALE",
      availabilityStatus: "AVAILABLE",
      propertyType: "HOUSE",
      priceType: "FIXED",
      bedrooms: 0,
      bathrooms: 0,
      receptions: 0,
      country: "United Kingdom",
      latitude: 51.5074,
      longitude: -0.1278,
      isPublished: false,
    },
  });

  const status = watch("status");

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create property");
      }

      const property = await response.json();
      toast({
        title: "Success",
        description: "Property created successfully",
        variant: "success",
      });
      router.push(`/dashboard/properties/${property.id}`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/properties"
          className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Properties
        </Link>
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new property listing
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Listing Type *</Label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setValue("status", value as "FOR_SALE" | "TO_RENT")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOR_SALE">For Sale</SelectItem>
                        <SelectItem value="TO_RENT">To Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      defaultValue="HOUSE"
                      onValueChange={(value) => setValue("propertyType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Beautiful 3 Bedroom Family Home"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the property..."
                    rows={6}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="250000"
                      {...register("price", { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceType">Price Type *</Label>
                    <Select
                      defaultValue="FIXED"
                      onValueChange={(value) => setValue("priceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed Price</SelectItem>
                        <SelectItem value="OFFERS_OVER">Offers Over</SelectItem>
                        <SelectItem value="OFFERS_REGION">OIRO</SelectItem>
                        <SelectItem value="POA">POA</SelectItem>
                        {status === "TO_RENT" && (
                          <>
                            <SelectItem value="PCM">Per Month</SelectItem>
                            <SelectItem value="PW">Per Week</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      {...register("bedrooms", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      {...register("bathrooms", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receptions">Receptions</Label>
                    <Input
                      id="receptions"
                      type="number"
                      min="0"
                      {...register("receptions", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="floorAreaSqFt">Floor Area (sq ft)</Label>
                    <Input
                      id="floorAreaSqFt"
                      type="number"
                      min="0"
                      {...register("floorAreaSqFt", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epcRating">EPC Rating</Label>
                    <Select onValueChange={(value) => setValue("epcRating", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="NOT_SPECIFIED">Not Specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure</Label>
                    <Select onValueChange={(value) => setValue("tenure", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREEHOLD">Freehold</SelectItem>
                        <SelectItem value="LEASEHOLD">Leasehold</SelectItem>
                        <SelectItem value="SHARE_OF_FREEHOLD">
                          Share of Freehold
                        </SelectItem>
                        <SelectItem value="NOT_SPECIFIED">Not Specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="councilTaxBand">Council Tax Band</Label>
                    <Input
                      id="councilTaxBand"
                      placeholder="e.g., D"
                      {...register("councilTaxBand")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    placeholder="123 High Street"
                    {...register("addressLine1")}
                  />
                  {errors.addressLine1 && (
                    <p className="text-sm text-destructive">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Apartment 4B"
                    {...register("addressLine2")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="London"
                      {...register("city")}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      placeholder="Greater London"
                      {...register("county")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="SW1A 1AA"
                      {...register("postcode")}
                    />
                    {errors.postcode && (
                      <p className="text-sm text-destructive">
                        {errors.postcode.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      defaultValue="United Kingdom"
                      {...register("country")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="51.5074"
                      {...register("latitude", { valueAsNumber: true })}
                    />
                    {errors.latitude && (
                      <p className="text-sm text-destructive">
                        {errors.latitude.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-0.1278"
                      {...register("longitude", { valueAsNumber: true })}
                    />
                    {errors.longitude && (
                      <p className="text-sm text-destructive">
                        {errors.longitude.message}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tip: You can find coordinates using Google Maps or similar services.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("hasGarden")}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Garden
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("hasGarage")}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Garage
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("hasParking")}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Parking
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("hasCentralHeating")}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Central Heating
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("hasDoubleGlazing")}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Double Glazing
                  </label>
                  {status === "TO_RENT" && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register("petsAllowed")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Pets Allowed
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                  <Input
                    id="parkingSpaces"
                    type="number"
                    min="0"
                    {...register("parkingSpaces", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
                  <Input
                    id="virtualTourUrl"
                    type="url"
                    placeholder="https://..."
                    {...register("virtualTourUrl")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href="/dashboard/properties">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Property
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
