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
import { Loader2, Save, Palette } from "lucide-react";

export default function BrandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgencySettingsValues>({
    resolver: zodResolver(agencySettingsSchema),
    defaultValues: {
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
      accentColor: "#f59e0b",
    },
  });

  const primaryColor = watch("primaryColor");
  const secondaryColor = watch("secondaryColor");
  const accentColor = watch("accentColor");

  useEffect(() => {
    fetchAgency();
  }, []);

  const fetchAgency = async () => {
    try {
      // Fetch the current user's session to get agency ID
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.agencyId) {
        setAgencyId(session.user.agencyId);
        const response = await fetch(`/api/agencies/${session.user.agencyId}`);
        const agency = await response.json();

        // Set form values
        setValue("name", agency.name || "");
        setValue("email", agency.email || "");
        setValue("phone", agency.phone || "");
        setValue("website", agency.website || "");
        setValue("logoUrl", agency.logoUrl || "");
        setValue("heroImageUrl", agency.heroImageUrl || "");
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
        throw new Error("Failed to update branding");
      }

      toast({
        title: "Success",
        description: "Branding updated successfully",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update branding",
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
        <h1 className="text-3xl font-bold">Branding</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your property portal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo & Images */}
        <Card>
          <CardHeader>
            <CardTitle>Logo & Images</CardTitle>
            <CardDescription>
              Upload your agency logo and hero image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                placeholder="https://example.com/logo.png"
                {...register("logoUrl")}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of your logo image. For best results, use a PNG with transparent background.
              </p>
              {/* TODO: Add file upload integration here */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroImageUrl">Hero Image URL</Label>
              <Input
                id="heroImageUrl"
                placeholder="https://example.com/hero.jpg"
                {...register("heroImageUrl")}
              />
              <p className="text-xs text-muted-foreground">
                This image will be displayed as a background on your homepage.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Colors
            </CardTitle>
            <CardDescription>
              Set your brand colors for buttons, links, and accents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    className="h-10 w-16 cursor-pointer p-1"
                    value={primaryColor}
                    onChange={(e) => setValue("primaryColor", e.target.value)}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setValue("primaryColor", e.target.value)}
                    placeholder="#2563eb"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for buttons and main CTAs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    className="h-10 w-16 cursor-pointer p-1"
                    value={secondaryColor}
                    onChange={(e) => setValue("secondaryColor", e.target.value)}
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setValue("secondaryColor", e.target.value)}
                    placeholder="#1e40af"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for hover states and backgrounds
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    className="h-10 w-16 cursor-pointer p-1"
                    value={accentColor}
                    onChange={(e) => setValue("accentColor", e.target.value)}
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setValue("accentColor", e.target.value)}
                    placeholder="#f59e0b"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for highlights and badges
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border p-4">
              <p className="mb-4 text-sm font-medium">Preview</p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Secondary Button
                </button>
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Badge
                </span>
              </div>
            </div>
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
