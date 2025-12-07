"use client";

import Link from "next/link";
import { useAgency } from "@/contexts/agency-context";
import { Phone, Mail, MapPin } from "lucide-react";

export function PublicFooter() {
  const { agency } = useAgency();

  if (!agency) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Agency Info */}
          <div>
            <h3 className="text-lg font-semibold">{agency.name}</h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {agency.email}
                </a>
              )}
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  {agency.phone}
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <Link
                href={`/agency/${agency.slug}/search?status=FOR_SALE`}
                className="text-muted-foreground hover:text-foreground"
              >
                Properties For Sale
              </Link>
              <Link
                href={`/agency/${agency.slug}/search?status=TO_RENT`}
                className="text-muted-foreground hover:text-foreground"
              >
                Properties To Rent
              </Link>
              <Link
                href={`/agency/${agency.slug}/contact`}
                className="text-muted-foreground hover:text-foreground"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold">Information</h3>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {agency.name}. All rights reserved.
          </p>
          <p className="mt-1">
            Powered by{" "}
            <a href="/" className="text-primary hover:underline">
              PropertyHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
