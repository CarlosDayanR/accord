import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "./components/Sidebar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number((session.user as any).id);

  // Check if user has a business
  const business = await prisma.businesses.findFirst({
    where: { user_id: userId },
  });

  // If no business, we don't show the sidebar yet, the child page (dashboard/page.tsx) 
  // will handle showing the registration form.
  
  return (
    <div className="min-h-screen bg-bg-surface text-text-main p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-0 md:gap-8 h-[calc(100vh-4rem)]">
          <Sidebar 
            businessName={business?.name || "Nuevo negocio"} 
            logoUrl={business?.logoUrl}
            userName={session.user.name || "Usuario"} 
            hasBusiness={!!business}
          />
          <main className="flex-1 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pt-6 md:pt-0 pb-16 pr-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
