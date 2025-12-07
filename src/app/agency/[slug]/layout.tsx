import { notFound } from "next/navigation";
import { getAgencyBySlug } from "@/lib/agency";
import { AgencyProvider, getAgencyThemeStyles } from "@/contexts/agency-context";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import type { Metadata } from "next";

interface AgencyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) {
    return {
      title: "Agency Not Found",
    };
  }

  return {
    title: {
      default: agency.name,
      template: `%s | ${agency.name}`,
    },
    description: `Browse properties for sale and rent from ${agency.name}`,
  };
}

export default async function AgencyLayout({ children, params }: AgencyLayoutProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);

  if (!agency) {
    notFound();
  }

  const themeStyles = getAgencyThemeStyles(agency);

  return (
    <AgencyProvider agency={agency}>
      <div
        className="flex min-h-screen flex-col"
        style={themeStyles as React.CSSProperties}
      >
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </AgencyProvider>
  );
}
