import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardOnboarding from "./components/DashboardOnboarding";
import TodayAppointmentsList from "./components/TodayAppointmentsList";

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

  // Variables for business data
  let stats = { todayCount: 0, pendingCount: 0, servicesCount: 0, totalAppts: 0, hoursCount: 0 };
  let todayAppointments: any[] = [];
  let formattedDate = "";
  let hoursDisplay = "";
  
  if (business) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDateString = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(today);
    formattedDate = todayDateString.charAt(0).toUpperCase() + todayDateString.slice(1);

    const [todayCount, pendingCount, servicesCount, totalAppts, hoursCount, appointments, todayHours] = await Promise.all([
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
      prisma.business_hours.count({
        where: {
          business_id: business.id,
        },
      }),
      prisma.appointments.findMany({
        where: {
          business_id: business.id,
          appointment_datetime: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          services: true,
        },
        orderBy: {
          appointment_datetime: "asc",
        },
      }),
      prisma.business_hours.findFirst({
        where: {
          business_id: business.id,
          day_of_week: (new Date().getDay() + 6) % 7,
        },
      }),
    ]);
    
    stats = { todayCount, pendingCount, servicesCount, totalAppts, hoursCount };
    todayAppointments = appointments;

    const formatTime = (date: Date) => {
      const h = date.getHours();
      const m = date.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    };

    if (todayHours) {
      hoursDisplay = todayHours.is_closed 
        ? "Hoy: Cerrado" 
        : `Hoy: ${formatTime(todayHours.open_time)} - ${formatTime(todayHours.close_time)}`;
    }
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 text-xs font-semibold text-brand-blue mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              {business.business_subcategories.name}
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight text-text-main">Bienvenido, {business.name}</h1>
                <p className="text-text-muted">Desde aquí podrás gestionar tus citas y servicios en tiempo real.</p>
              </div>
              {hoursDisplay && (
                <div className="flex items-center gap-2 text-sm text-text-muted bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100/50">
                  <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{hoursDisplay}</span>
                </div>
              )}
            </div>
          </div>

          {/* Onboarding Nudge */}
          {(stats.servicesCount === 0 || stats.hoursCount === 0) && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_6px_16px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 border border-brand-blue/20">
                  <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-main mb-1">¡Casi listo para recibir clientes!</h2>
                  <p className="text-sm text-text-muted">Para que tus clientes puedan agendar, necesitamos saber qué ofreces y cuándo estás disponible.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                {stats.hoursCount === 0 && (
                  <Link href="/dashboard/hours" className="btn-primary whitespace-nowrap w-full sm:w-auto">
                    Definir mis horarios
                  </Link>
                )}
                {stats.servicesCount === 0 && (
                  <Link href="/dashboard/services" className="btn-primary whitespace-nowrap w-full sm:w-auto">
                    Agregar mi primer servicio
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Tarjetas de Estadísticas */}
          <div className="px-4 py-8 sm:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard/appointments" className="card card-interactive p-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <p className="text-text-muted text-sm font-bold mb-1">Citas hoy</p>
                <p className="text-4xl font-bold text-text-main group-hover:text-brand-blue transition-colors origin-left">{stats.todayCount}</p>
              </Link>
              <Link href="/dashboard/appointments" className="card card-interactive p-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <p className="text-text-muted text-sm font-bold mb-1">Citas pendientes</p>
                <p className={`text-4xl font-bold transition-colors origin-left ${stats.pendingCount > 0 ? 'text-brand-blue group-hover:text-brand-blue-hover' : 'text-text-muted group-hover:text-text-main'}`}>
                  {stats.pendingCount}
                </p>
              </Link>
              <Link href="/dashboard/services" className="card card-interactive p-6 flex flex-col justify-center group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <p className="text-text-muted text-sm font-bold mb-1">Servicios activos</p>
                <p className="text-3xl font-bold text-text-main group-hover:text-brand-blue transition-colors origin-left">{stats.servicesCount}</p>
              </Link>
            </div>
          </div>

          {/* Agenda del Día */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-main tracking-tight">Citas de hoy</h2>
              <p className="text-text-muted capitalize">{formattedDate}</p>
            </div>

            <TodayAppointmentsList appointments={todayAppointments} businessSlug={business.slug} />
          </div>
        </div>
      )}
    </>
  );
}
