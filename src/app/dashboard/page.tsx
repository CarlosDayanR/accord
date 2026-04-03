import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BusinessRegistrationForm from "./components/BusinessRegistrationForm";
import DashboardOnboarding from "./components/DashboardOnboarding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number((session.user as any).id);

  // Check if user has a business
  const business = await prisma.businesses.findFirst({
    where: { user_id: userId },
    include: {
      business_subcategories: {
        include: {
          business_categories: true,
        },
      },
    },
  });

  // Fetch categories and subcategories for the registration form (needed if no business)
  const categories = await prisma.business_categories.findMany({
    include: {
      business_subcategories: true,
    },
  });

  // If business exists, fetch stats in parallel
  let stats = { todayCount: 0, pendingCount: 0, servicesCount: 0, totalAppts: 0 };
  
  if (business) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayCount, pendingCount, servicesCount, totalAppts] = await Promise.all([
      prisma.appointments.count({
        where: {
          business_id: business.id,
          appointment_datetime: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.appointments.count({
        where: {
          business_id: business.id,
          status: "pending",
        },
      }),
      prisma.services.count({
        where: {
          business_id: business.id,
        },
      }),
      prisma.appointments.count({
        where: {
          business_id: business.id,
        },
      }),
    ]);
    
    stats = { todayCount, pendingCount, servicesCount, totalAppts };
  }

  return (
    <>
      {!business ? (
        <div className="max-w-4xl mx-auto py-6">
          <DashboardOnboarding categories={categories} />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-blue/5 border border-brand-blue/10 text-[10px] font-bold uppercase tracking-wider text-brand-blue mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              {business.business_subcategories.name}
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-text-main">Bienvenido, {business.name}</h1>
            <p className="text-text-muted">Desde aquí podrás gestionar tus citas y servicios en tiempo real.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card card-interactive p-6 group">
              <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Citas Hoy</p>
              <p className="text-4xl font-bold text-text-main group-hover:scale-105 transition-transform origin-left">{stats.todayCount}</p>
            </div>
            <div className="card card-interactive p-6 group">
              <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Citas Pendientes</p>
              <p className={`text-4xl font-bold group-hover:scale-105 transition-transform origin-left ${stats.pendingCount > 0 ? 'text-brand-blue' : 'text-text-muted'}`}>
                {stats.pendingCount}
              </p>
            </div>
            <div className="card card-interactive p-6 flex flex-col justify-center group">
              <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Servicios Activos</p>
              <p className="text-3xl font-bold text-text-main group-hover:scale-105 transition-transform origin-left">{stats.servicesCount}</p>
            </div>
          </div>

          {stats.totalAppts === 0 && (
            <div className="card mt-4 p-12 border-dashed text-center flex flex-col items-center justify-center gap-4 bg-bg-surface">
              <div className="w-16 h-16 bg-bg-base rounded-full flex items-center justify-center border border-surface-border mb-2 shadow-sm">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-text-main mb-1">¿Todo listo para empezar?</p>
                <p className="text-text-muted text-sm max-w-sm">Configura tus servicios y horarios para comenzar a recibir reservas directamente en tu página pública.</p>
              </div>
              <Link 
                href="/dashboard/services"
                className="btn-primary mt-2"
              >
                Registrar primer servicio
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
