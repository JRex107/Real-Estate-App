"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createAgencySchema, type CreateAgencyValues } from "@/lib/validations";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function NewAgencyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAgencyValues>({
    resolver: zodResolver(createAgencySchema),
    defaultValues: {
      maxProperties: 10,
      planTier: "free",
    },
  });

  const name = watch("name");

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setValue("name", value);
    setValue("slug", slugify(value));
  };

  const onSubmit = async (data: CreateAgencyValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create agency");
      }

      toast({
        title: "Success",
        description: "Agency created successfully",
        variant: "success",
      });
      router.push("/admin/agencies");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create agency",
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
          href="/admin/agencies"
          className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Agencies
        </Link>
        <h1 className="text-3xl font-bold">Create New Agency</h1>
        <p className="text-muted-foreground">
          Set up a new agency on the platform
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Agency Details */}
        <Card>
          <CardHeader>
            <CardTitle>Agency Details</CardTitle>
            <CardDescription>Basic information about the agency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agency Name *</Label>
              <Input
                id="name"
                placeholder="ABC Estate Agents"
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                placeholder="abc-estate-agents"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This will be used in the agency&apos;s public URL
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Agency Email *</Label>
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
          </CardContent>
        </Card>

        {/* Admin User */}
        <Card>
          <CardHeader>
            <CardTitle>Admin User</CardTitle>
            <CardDescription>
              Create the initial admin user for this agency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name *</Label>
                <Input
                  id="adminName"
                  placeholder="John Smith"
                  {...register("adminName")}
                />
                {errors.adminName && (
                  <p className="text-sm text-destructive">
                    {errors.adminName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@agency.com"
                  {...register("adminEmail")}
                />
                {errors.adminEmail && (
                  <p className="text-sm text-destructive">
                    {errors.adminEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Initial Password *</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="At least 8 characters"
                {...register("adminPassword")}
              />
              {errors.adminPassword && (
                <p className="text-sm text-destructive">
                  {errors.adminPassword.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Settings</CardTitle>
            <CardDescription>Configure the agency&apos;s plan and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planTier">Plan Tier</Label>
                <Select
                  defaultValue="free"
                  onValueChange={(value) => setValue("planTier", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxProperties">Max Properties</Label>
                <Input
                  id="maxProperties"
                  type="number"
                  min="1"
                  {...register("maxProperties", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/agencies">
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
                Create Agency
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
