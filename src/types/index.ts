import type {
  Agency,
  Property,
  PropertyImage,
  Enquiry,
  User,
  OfficeLocation,
} from "@prisma/client";

// ============================================================================
// Re-export Prisma enums for convenience
// ============================================================================

export {
  UserRole,
  AgencyStatus,
  PropertyStatus,
  AvailabilityStatus,
  PropertyType,
  Tenure,
  FurnishedStatus,
  PriceType,
  EpcRating,
  EnquiryStatus,
} from "@prisma/client";

// ============================================================================
// Extended Types with Relations
// ============================================================================

export type PropertyWithImages = Property & {
  images: PropertyImage[];
};

export type PropertyWithDetails = Property & {
  images: PropertyImage[];
  agency: Pick<Agency, "id" | "name" | "slug" | "logoUrl" | "primaryColor">;
  _count?: {
    enquiries: number;
  };
};

export type AgencyWithStats = Agency & {
  _count: {
    properties: number;
    users: number;
    enquiries: number;
  };
};

export type AgencyBranding = Pick<
  Agency,
  | "id"
  | "name"
  | "slug"
  | "logoUrl"
  | "heroImageUrl"
  | "primaryColor"
  | "secondaryColor"
  | "accentColor"
  | "email"
  | "phone"
  | "website"
>;

export type EnquiryWithProperty = Enquiry & {
  property: Pick<Property, "id" | "title" | "slug" | "addressLine1" | "city">;
};

export type UserWithAgency = User & {
  agency: Pick<Agency, "id" | "name" | "slug"> | null;
};

// ============================================================================
// API Request/Response Types
// ============================================================================

// Property search filters
export interface PropertySearchFilters {
  status?: "FOR_SALE" | "TO_RENT";
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  propertyType?: string;
  keyword?: string;
  city?: string;
  postcode?: string;
  agencySlug?: string;
  availabilityStatus?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Property search response (includes map data)
export interface PropertySearchResponse extends PaginatedResponse<PropertyWithImages> {
  mapData: {
    id: string;
    latitude: number;
    longitude: number;
    price: number;
    title: string;
    status: string;
  }[];
}

// ============================================================================
// Form Types
// ============================================================================

export interface PropertyFormData {
  title: string;
  description: string;
  status: "FOR_SALE" | "TO_RENT";
  availabilityStatus: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  country?: string;
  latitude: number;
  longitude: number;
  price: number;
  priceType: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  tenure?: string;
  furnishedStatus?: string;
  floorAreaSqFt?: number;
  epcRating?: string;
  councilTaxBand?: string;
  yearBuilt?: number;
  parkingSpaces?: number;
  hasGarden?: boolean;
  hasGarage?: boolean;
  hasParking?: boolean;
  hasCentralHeating?: boolean;
  hasDoubleGlazing?: boolean;
  petsAllowed?: boolean;
  virtualTourUrl?: string;
  videoUrl?: string;
  keyFeatures?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface EnquiryFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId: string;
}

export interface AgencySettingsFormData {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface UserInviteFormData {
  email: string;
  name: string;
  role: "AGENCY_ADMIN" | "AGENT";
}

// ============================================================================
// Session Types
// ============================================================================

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: "PLATFORM_ADMIN" | "AGENCY_ADMIN" | "AGENT";
  agencyId?: string | null;
  agencySlug?: string | null;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
  totalProperties: number;
  forSale: number;
  toRent: number;
  available: number;
  underOffer: number;
  sold: number;
  letAgreed: number;
  totalEnquiries: number;
  newEnquiries: number;
  recentEnquiries: EnquiryWithProperty[];
}

// ============================================================================
// Platform Admin Types
// ============================================================================

export interface PlatformStats {
  totalAgencies: number;
  activeAgencies: number;
  suspendedAgencies: number;
  totalUsers: number;
  totalProperties: number;
  totalEnquiries: number;
}
