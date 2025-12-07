import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Platform admins should go to admin panel
  if (session.user.role === "PLATFORM_ADMIN") {
    redirect("/admin");
  }

  // Get agency details
  const agency = session.user.agencyId
    ? await prisma.agency.findUnique({
        where: { id: session.user.agencyId },
        select: { name: true, slug: true, status: true },
      })
    : null;

  // Check if agency is suspended
  if (agency?.status === "SUSPENDED") {
    redirect("/suspended");
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar agencyName={agency?.name} agencySlug={agency?.slug} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
