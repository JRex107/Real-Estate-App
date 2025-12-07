"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { agencySettingsSchema, type AgencySettingsValues } from "@/lib/validations";
import { Loader2, Save, Building2, Globe } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencySlug, setAgencySlug] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AgencySettingsValues>({
    resolver: zodResolver(agencySettingsSchema),
  });

  useEffect(() => {
    fetchAgency();
  }, []);

  const fetchAgency = async () => {
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.agencyId) {
        setAgencyId(session.user.agencyId);
        const response = await fetch(`/api/agencies/${session.user.agencyId}`);
        const agency = await response.json();

        setAgencySlug(agency.slug);
        setValue("name", agency.name || "");
        setValue("email", agency.email || "");
        setValue("phone", agency.phone || "");
        setValue("website", agency.website || "");
        setValue("addressLine1", agency.addressLine1 || "");
        setValue("addressLine2", agency.addressLine2 || "");
        setValue("city", agency.city || "");
        setValue("county", agency.county || "");
        setValue("postcode", agency.postcode || "");
        setValue("primaryColor", agency.primaryColor || "#2563eb");
        setValue("secondaryColor", agency.secondaryColor || "#1e40af");
        setValue("accentColor", agency.accentColor || "#f59e0b");
      }
    } catch (error) {
      console.error("Error fetching agency:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AgencySettingsValues) => {
    if (!agencyId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/agencies/${agencyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast({
        title: "Success",
        description: "Settings updated successfully",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your agency profile and contact details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Agency Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Agency Profile
            </CardTitle>
            <CardDescription>
              Basic information about your agency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agency Name *</Label>
              <Input
                id="name"
                placeholder="Your Agency Name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@agency.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="020 1234 5678"
                  {...register("phone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://www.youragency.com"
                {...register("website")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Office Address</CardTitle>
            <CardDescription>
              Your main office location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                placeholder="123 High Street"
                {...register("addressLine1")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Suite 100"
                {...register("addressLine2")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="London"
                  {...register("city")}
                />
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

            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                placeholder="SW1A 1AA"
                className="max-w-[200px]"
                {...register("postcode")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Public URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Public URL
            </CardTitle>
            <CardDescription>
              Your public property portal link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <code className="text-sm">
                {typeof window !== "undefined" ? window.location.origin : ""}/agency/{agencySlug}
              </code>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Share this link with your clients to browse your properties.
              {/* Future: Custom domain support */}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
