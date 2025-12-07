import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Search, Users, Palette } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PropertyHub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Property Listing Platform
            <br />
            <span className="text-primary">for Estate Agents</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A complete SaaS solution for estate agents to showcase properties,
            manage enquiries, and grow their business with customizable branding.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            Everything You Need
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Our platform provides all the tools estate agents need to manage
            and display their property portfolio.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-6">
              <Search className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Property Search</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Advanced search with map and list views, filters, and location-based
                browsing.
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <Building2 className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Listing Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Easy-to-use dashboard for managing properties, images, and
                availability status.
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <Users className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Enquiry System</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Capture and manage enquiries from potential buyers and tenants
                efficiently.
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <Palette className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">White Labelling</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Customize colors, logos, and branding to match your agency&apos;s
                identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join hundreds of estate agents who trust PropertyHub to power their
            property listings.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-8">
              Create Your Agency
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PropertyHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
