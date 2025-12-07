import { z } from "zod";

// ============================================================================
// Property Validations
// ============================================================================

export const propertyFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  status: z.enum(["FOR_SALE", "TO_RENT"]),
  availabilityStatus: z.enum([
    "AVAILABLE",
    "UNDER_OFFER",
    "SOLD",
    "LET_AGREED",
    "WITHDRAWN",
  ]),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  county: z.string().optional(),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, "Invalid UK postcode"),
  country: z.string().default("United Kingdom"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  price: z.number().min(0, "Price must be positive"),
  priceType: z.enum(["FIXED", "OFFERS_OVER", "OFFERS_REGION", "POA", "PCM", "PW", "PA"]),
  propertyType: z.enum([
    "HOUSE",
    "FLAT",
    "APARTMENT",
    "BUNGALOW",
    "COTTAGE",
    "MAISONETTE",
    "STUDIO",
    "TERRACED",
    "SEMI_DETACHED",
    "DETACHED",
    "END_TERRACE",
    "TOWNHOUSE",
    "LAND",
    "COMMERCIAL",
    "OTHER",
  ]),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  receptions: z.number().min(0).max(20),
  tenure: z
    .enum([
      "FREEHOLD",
      "LEASEHOLD",
      "SHARE_OF_FREEHOLD",
      "COMMONHOLD",
      "NOT_SPECIFIED",
    ])
    .optional(),
  furnishedStatus: z
    .enum(["FURNISHED", "PART_FURNISHED", "UNFURNISHED", "NOT_SPECIFIED"])
    .optional(),
  floorAreaSqFt: z.number().min(0).optional(),
  epcRating: z.enum(["A", "B", "C", "D", "E", "F", "G", "NOT_SPECIFIED"]).optional(),
  councilTaxBand: z.string().optional(),
  yearBuilt: z.number().min(1600).max(new Date().getFullYear()).optional(),
  parkingSpaces: z.number().min(0).optional(),
  hasGarden: z.boolean().optional(),
  hasGarage: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasCentralHeating: z.boolean().optional(),
  hasDoubleGlazing: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  virtualTourUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  keyFeatures: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

// ============================================================================
// Enquiry Validations
// ============================================================================

export const enquiryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[\d\s+()-]{10,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
  propertyId: z.string().min(1),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

// ============================================================================
// Agency Settings Validations
// ============================================================================

export const agencySettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
});

export type AgencySettingsValues = z.infer<typeof agencySettingsSchema>;

// ============================================================================
// User Validations
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const userInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["AGENCY_ADMIN", "AGENT"]),
});

export type UserInviteValues = z.infer<typeof userInviteSchema>;

// ============================================================================
// Search/Filter Validations
// ============================================================================

export const propertySearchSchema = z.object({
  status: z.enum(["FOR_SALE", "TO_RENT"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minBedrooms: z.coerce.number().min(0).optional(),
  maxBedrooms: z.coerce.number().min(0).optional(),
  propertyType: z.string().optional(),
  keyword: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  agencySlug: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PropertySearchValues = z.infer<typeof propertySearchSchema>;

// ============================================================================
// Agency Creation (Platform Admin)
// ============================================================================

export const createAgencySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  adminEmail: z.string().email("Invalid admin email"),
  adminName: z.string().min(2, "Admin name required"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
  maxProperties: z.number().min(1).default(10),
  planTier: z.string().default("free"),
});

export type CreateAgencyValues = z.infer<typeof createAgencySchema>;
