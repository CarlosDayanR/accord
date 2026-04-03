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
    <div className="min-h-screen bg-white text-text-main selection:bg-brand-blue selection:text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-12">
          {business.logoUrl ? (
            <img 
              src={business.logoUrl} 
              alt={business.name} 
              className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-sm" 
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center mb-4">
              <span className="text-xs uppercase tracking-widest font-bold text-brand-blue text-center px-2">
                {business.business_subcategories.name}
              </span>
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-text-main mb-3">
            {business.name}
          </h1>
          <p className="text-text-muted max-w-xl mx-auto text-base">
            {business.description || business.policies || "Especialistas en servicios de alta calidad. Agenda tu cita hoy mismo."}
          </p>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-text-main">
            <a 
              href={`tel:${business.phone}`}
              className="btn-pill-white !px-4 !py-2"
            >
              <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {business.phone}
            </a>
            <div className="tag-pill-white !px-4 !py-2">
              <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {business.address || "Consultar ubicación"}
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Services */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold text-text-main mb-4">
              Nuestros Servicios
            </h2>
            <div className="space-y-4">
              {business.services.length > 0 ? (
                business.services.map((service) => (
                  <div 
                    key={service.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-surface-border hover:-translate-y-1 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-text-main">
                        {service.name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-text-muted mt-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.duration_minutes} min
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                      <span className="text-text-main font-semibold">
                        {formatPrice(service.price_display)}
                      </span>
                      <BookingButton 
                        serviceId={service.id}
                        serviceName={service.name}
                        businessId={business.id}
                        className="btn-primary whitespace-nowrap"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-muted italic bg-white p-6 rounded-2xl border border-surface-border shadow-sm text-center">
                  No hay servicios registrados.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Hours & Map */}
          <div className="space-y-6 sticky top-8">
            <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-text-main">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horarios
              </h2>
              <div className="space-y-1">
                {DAYS.map((day, index) => {
                  const hour = business.business_hours.find(h => h.day_of_week === index);
                  const isToday = index === currentDayIndex;
                  return (
                    <div 
                      key={day} 
                      className={`flex items-center justify-between text-sm py-2.5 border-b last:border-0 border-surface-border/60 ${isToday ? 'font-bold' : 'text-text-muted'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`${isToday ? 'text-text-main' : ''}`}>{day}</span>
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                      <span className={`font-medium font-mono ${hour?.is_closed ? 'text-red-500 text-[10px] uppercase tracking-widest' : 'text-text-main'}`}>
                        {hour?.is_closed 
                          ? "Cerrado" 
                          : hour 
                            ? `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`
                            : "—"
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {business.address && (
              <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm">
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold mb-2">Google Maps</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    business.address
                      .replace(/Col\.\s?/gi, "")
                      .replace(/C\.P\.\s?/gi, "")
                      .replace(/Int\.?\s?/gi, "")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-blue-hover hover:underline transition-all"
                >
                  Abrir mapa
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-surface-border flex flex-col md:flex-row items-center justify-between text-text-muted gap-4 text-center md:text-left">
          <p className="text-xs">© {new Date().getFullYear()} {business.name}.</p>
          <div className="text-[10px] uppercase tracking-widest font-bold">Powered by Accord</div>
        </footer>

      </div>
    </div>
  );
}
