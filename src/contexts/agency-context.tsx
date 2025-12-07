"use client";

import { createContext, useContext, ReactNode } from "react";
import type { AgencyBranding } from "@/types";

interface AgencyContextType {
  agency: AgencyBranding | null;
  isLoading: boolean;
}

const AgencyContext = createContext<AgencyContextType>({
  agency: null,
  isLoading: false,
});

interface AgencyProviderProps {
  children: ReactNode;
  agency: AgencyBranding | null;
}

export function AgencyProvider({ children, agency }: AgencyProviderProps) {
  return (
    <AgencyContext.Provider value={{ agency, isLoading: false }}>
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgency() {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error("useAgency must be used within an AgencyProvider");
  }
  return context;
}

/**
 * Get CSS custom properties for agency branding
 */
export function getAgencyThemeStyles(agency: AgencyBranding | null): Record<string, string> {
  if (!agency) {
    return {};
  }

  // Convert hex to HSL for Tailwind CSS variables
  const primaryHsl = hexToHsl(agency.primaryColor);
  const secondaryHsl = hexToHsl(agency.secondaryColor);
  const accentHsl = hexToHsl(agency.accentColor);

  return {
    "--primary": primaryHsl,
    "--primary-foreground": "0 0% 100%",
    "--secondary": secondaryHsl,
    "--secondary-foreground": "0 0% 100%",
    "--accent": accentHsl,
    "--accent-foreground": "0 0% 100%",
  };
}

/**
 * Convert hex color to HSL string for CSS
 */
function hexToHsl(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Default branding values
 */
export const defaultBranding: AgencyBranding = {
  id: "default",
  name: "PropertyHub",
  slug: "default",
  logoUrl: null,
  heroImageUrl: null,
  primaryColor: "#2563eb",
  secondaryColor: "#1e40af",
  accentColor: "#f59e0b",
  email: "info@propertyhub.com",
  phone: null,
  website: null,
};
