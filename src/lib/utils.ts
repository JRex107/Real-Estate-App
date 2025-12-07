import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price for display
 */
export function formatPrice(
  price: number | string,
  priceType: string = "FIXED"
): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedPrice = formatter.format(numPrice);

  switch (priceType) {
    case "OFFERS_OVER":
      return `Offers over ${formattedPrice}`;
    case "OFFERS_REGION":
      return `OIRO ${formattedPrice}`;
    case "POA":
      return "Price on Application";
    case "PCM":
      return `${formattedPrice} pcm`;
    case "PW":
      return `${formattedPrice} pw`;
    case "PA":
      return `${formattedPrice} pa`;
    default:
      return formattedPrice;
  }
}

/**
 * Generate URL-friendly slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(d);
}

/**
 * Get property status badge config
 */
export function getAvailabilityBadge(status: string): {
  label: string;
  variant: "default" | "success" | "warning" | "danger";
} {
  switch (status) {
    case "AVAILABLE":
      return { label: "Available", variant: "success" };
    case "UNDER_OFFER":
      return { label: "Under Offer", variant: "warning" };
    case "SOLD":
      return { label: "Sold", variant: "danger" };
    case "LET_AGREED":
      return { label: "Let Agreed", variant: "warning" };
    case "WITHDRAWN":
      return { label: "Withdrawn", variant: "default" };
    default:
      return { label: status, variant: "default" };
  }
}

/**
 * Get readable property type
 */
export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HOUSE: "House",
    FLAT: "Flat",
    APARTMENT: "Apartment",
    BUNGALOW: "Bungalow",
    COTTAGE: "Cottage",
    MAISONETTE: "Maisonette",
    STUDIO: "Studio",
    TERRACED: "Terraced House",
    SEMI_DETACHED: "Semi-Detached",
    DETACHED: "Detached",
    END_TERRACE: "End Terrace",
    TOWNHOUSE: "Townhouse",
    LAND: "Land",
    COMMERCIAL: "Commercial",
    OTHER: "Other",
  };
  return labels[type] || type;
}

/**
 * Build search query params object
 */
export function buildSearchParams(
  params: Record<string, string | number | undefined | null>
): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return searchParams;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a random string for temporary IDs
 */
export function generateId(length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
