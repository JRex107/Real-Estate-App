"use client";

import Link from "next/link";
import Image from "next/image";
import { useAgency } from "@/contexts/agency-context";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Menu } from "lucide-react";
import { useState } from "react";

export function PublicHeader() {
  const { agency } = useAgency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!agency) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        {/* Top bar with contact info */}
        <div className="hidden border-b py-2 text-sm md:flex md:items-center md:justify-between">
          <div className="flex items-center gap-4 text-muted-foreground">
            {agency.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Phone className="h-3 w-3" />
                {agency.phone}
              </a>
            )}
            {agency.email && (
              <a
                href={`mailto:${agency.email}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Mail className="h-3 w-3" />
                {agency.email}
              </a>
            )}
          </div>
          {agency.website && (
            <a
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              Visit main website
            </a>
          )}
        </div>

        {/* Main header */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/agency/${agency.slug}`} className="flex items-center gap-2">
            {agency.logoUrl ? (
              <Image
                src={agency.logoUrl}
                alt={agency.name}
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-primary">{agency.name}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href={`/agency/${agency.slug}/search?status=FOR_SALE`}
              className="text-sm font-medium hover:text-primary"
            >
              For Sale
            </Link>
            <Link
              href={`/agency/${agency.slug}/search?status=TO_RENT`}
              className="text-sm font-medium hover:text-primary"
            >
              To Rent
            </Link>
            <Link
              href={`/agency/${agency.slug}/contact`}
              className="text-sm font-medium hover:text-primary"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href={`/agency/${agency.slug}/search?status=FOR_SALE`}
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Sale
              </Link>
              <Link
                href={`/agency/${agency.slug}/search?status=TO_RENT`}
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                To Rent
              </Link>
              <Link
                href={`/agency/${agency.slug}/contact`}
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <hr />
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Phone className="h-4 w-4" />
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {agency.email}
                </a>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
