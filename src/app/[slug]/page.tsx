import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import BookingButton from "@/components/BookingButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await prisma.businesses.findUnique({
    where: { slug },
    include: {
      business_subcategories: {
        include: { business_categories: true },
      },
    },
  });

  if (!business) return { title: "Negocio no encontrado | Accord" };

  return {
    title: `${business.name} | Reserva tu cita en Accord`,
    description: `Reserva tu cita en ${business.name}. Especialistas en ${business.business_subcategories.name}. Gestionado por Accord.`,
  };
}

const DAYS = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

function formatTime(date: Date) {
  const timeStr = date.toISOString().substring(11, 16); // "HH:mm"
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function formatPrice(priceStr: string | null): string {
  if (!priceStr) return "A cotizar";
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return priceStr; // Fallback to raw if not numeric
  if (num === 0) return "Gratis";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN", // Using MXN as standard, you can change if needed
    minimumFractionDigits: 2,
  }).format(num);
}

export default async function PublicBusinessPage({ params }: PageProps) {
  const { slug } = await params;

  const business = await prisma.businesses.findUnique({
    where: { slug },
    include: {
      services: {
        orderBy: { id: "asc" },
      },
      business_hours: {
        orderBy: { day_of_week: "asc" },
      },
      business_subcategories: {
        include: { business_categories: true },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const currentDayIndex = (new Date().getDay() + 6) % 7; // Convert JS Sun=0 to Mon=0

  return (
    <div className="min-h-screen bg-bg-base text-text-main selection:bg-brand-blue selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden border-b border-surface-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/[0.05] blur-[120px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
          {business.logoUrl ? (
            <img 
              src={business.logoUrl} 
              alt={business.name} 
              className="w-24 h-24 rounded-3xl object-cover mb-8 border border-surface-border shadow-md p-1 bg-bg-surface" 
            />
          ) : (
            <div className="inline-flex items-center gap-2 bg-bg-surface border border-surface-border px-3 py-1 rounded-full mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-blue">
                {business.business_subcategories.business_categories.name} / {business.business_subcategories.name}
              </span>
            </div>
          )}
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-text-main">
            {business.name}
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium">
            {business.description || business.policies || "Especialistas en servicios de alta calidad. Agenda tu cita hoy mismo."}
          </p>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-text-muted font-bold uppercase tracking-widest">
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center gap-2.5 hover:text-text-main transition-all bg-bg-surface px-4 py-2 rounded-full border border-surface-border shadow-sm"
            >
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {business.phone}
            </a>
            <div className="flex items-center gap-2.5 bg-bg-surface px-4 py-2 rounded-full border border-surface-border shadow-sm">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {business.address || "Consultar ubicación"}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20">
        {/* Services List */}
        <div className="md:col-span-2 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-surface-border">
              <h2 className="text-3xl font-bold tracking-tight text-text-main">Nuestros Servicios</h2>
              <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Tarifario 2026</span>
            </div>
            <div className="space-y-6">
              {business.services.length > 0 ? (
                business.services.map((service) => (
                  <div 
                    key={service.id}
                    className="group bg-bg-surface border border-surface-border p-8 rounded-[32px] hover:border-brand-blue/30 transition-all duration-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-text-main group-hover:text-brand-blue transition-colors tracking-tight">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-text-muted">
                        <span className="flex items-center gap-1.5 bg-bg-base px-2.5 py-1 rounded-lg border border-surface-border">
                          <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration_minutes} min
                        </span>
                        <span className="text-emerald-600 font-mono text-lg lowercase italic tracking-tight">
                          {formatPrice(service.price_display)}
                        </span>
                      </div>
                    </div>
                    <BookingButton 
                      serviceId={service.id}
                      serviceName={service.name}
                      businessId={business.id}
                      className="btn-primary w-full sm:w-auto px-8"
                    />
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 italic">No hay servicios registrados.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Hours */}
        <div className="space-y-12">
          <div className="bg-bg-surface border border-surface-border p-10 rounded-[40px] sticky top-12 shadow-xl">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-text-main">
              <div className="w-10 h-10 rounded-2xl bg-bg-base flex items-center justify-center border border-surface-border">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Horarios
            </h2>
            <div className="space-y-5">
              {DAYS.map((day, index) => {
                const hour = business.business_hours.find(h => h.day_of_week === index);
                const isToday = index === currentDayIndex;
                return (
                  <div 
                    key={day} 
                    className={`flex items-center justify-between text-sm transition-all ${isToday ? 'scale-105 origin-left' : 'opacity-60'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold tracking-tight ${isToday ? 'text-brand-blue' : 'text-text-muted'}`}>{day}</span>
                      {isToday && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />}
                    </div>
                    <span className={`font-medium font-mono ${hour?.is_closed ? 'text-red-500 uppercase text-[10px] tracking-widest' : 'text-text-main'}`}>
                      {hour?.is_closed 
                        ? "Cerrado" 
                        : hour 
                          ? `${formatTime(hour.open_time)}`
                          : "—"
                      }
                      {!hour?.is_closed && hour && (
                        <span className="text-text-muted mx-1">/</span>
                      )}
                      {!hour?.is_closed && hour && formatTime(hour.close_time)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 pt-10 border-t border-surface-border space-y-4">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3">Ubicación</p>
                <p className="text-text-main text-sm leading-relaxed font-medium">{business.address || "Consultar por teléfono"}</p>
              </div>
              {business.address && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    business.address
                      .replace(/Col\.\s?/gi, "")
                      .replace(/C\.P\.\s?/gi, "")
                      .replace(/Int\.?\s?/gi, "")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:text-brand-blue-hover hover:underline transition-all"
                >
                  Ver en Google Maps
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto py-12 px-6 border-t border-surface-border flex items-center justify-between text-text-muted">
        <p className="text-xs">© 2026 {business.name}. Powered by Accord.</p>
        <div className="text-[10px] uppercase tracking-widest font-bold">Accord Platform</div>
      </footer>
    </div>
  );
}
