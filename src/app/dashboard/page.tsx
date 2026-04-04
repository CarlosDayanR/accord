import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BusinessRegistrationForm from "./components/BusinessRegistrationForm";
import DashboardOnboarding from "./components/DashboardOnboarding";
import CopyLinkButton from "./components/CopyLinkButton";

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
  let stats = { todayCount: 0, pendingCount: 0, servicesCount: 0, totalAppts: 0, hoursCount: 0 };
  let todayAppointments: any[] = [];
  let formattedDate = "";
  
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

    const [todayCount, pendingCount, servicesCount, totalAppts, hoursCount, appointments] = await Promise.all([
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
    ]);
    
    stats = { todayCount, pendingCount, servicesCount, totalAppts, hoursCount };
    todayAppointments = appointments;
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

          {/* Tarjetas de Estadísticas (Con colchón de espacio para sus sombras difusas) */}
          <div className="px-4 py-8 sm:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card card-interactive p-6 group">
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Citas hoy</p>
                <p className="text-4xl font-bold text-text-main group-hover:scale-105 transition-transform origin-left">{stats.todayCount}</p>
              </div>
              <div className="card card-interactive p-6 group">
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Citas pendientes</p>
                <p className={`text-4xl font-bold group-hover:scale-105 transition-transform origin-left ${stats.pendingCount > 0 ? 'text-brand-blue' : 'text-text-muted'}`}>
                  {stats.pendingCount}
                </p>
              </div>
              <div className="card card-interactive p-6 flex flex-col justify-center group">
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Servicios activos</p>
                <p className="text-3xl font-bold text-text-main group-hover:scale-105 transition-transform origin-left">{stats.servicesCount}</p>
              </div>
            </div>
          </div>

          {/* Agenda del Día */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-main tracking-tight">Citas de hoy</h2>
              <p className="text-text-muted capitalize">{formattedDate}</p>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-16 px-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-bg-base rounded-full flex items-center justify-center border border-surface-border mb-5">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-text-main mb-1.5">No tienes citas programadas para hoy</p>
                <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto leading-relaxed">¡Aprovecha para compartir tu enlace de reservas con tus clientes y llenar tu agenda!</p>
                <CopyLinkButton slug={business.slug} />
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appt) => {
                  const timeString = new Date(appt.appointment_datetime).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                  
                  return (
                    <div key={appt.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Izquierda: Hora y Datos */}
                      <div className="flex items-center gap-5">
                        <div className="shrink-0 w-24 text-center border-r border-slate-100 pr-5">
                          <p className="text-base font-bold text-brand-blue tracking-tight">{timeString}</p>
                        </div>
                        <div>
                          <p className="text-text-main font-semibold text-lg">{appt.customer_name}</p>
                          <p className="text-text-muted text-sm mt-0.5">{appt.services?.name || "Servicio no especificado"}</p>
                        </div>
                      </div>
                      
                      {/* Derecha: Píldora y Acción */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
                        <span className="tag-pill-white capitalize">
                          {appt.status}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/5">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
