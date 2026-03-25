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
  // Use toISOString and slice to get the time without timezone shifts, 
  // then convert to readable format if needed. 
  // Since Prisma TIME comes as 1970-01-01TXX:XX:XX.XXX, we take the time part.
  const timeStr = date.toISOString().substring(11, 16); // "HH:mm"
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.05] blur-[120px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1 rounded-full mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
              {business.business_subcategories.business_categories.name} / {business.business_subcategories.name}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            {business.name}
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {business.policies || "Bienvenido a nuestro espacio de atención profesional. Reserva tu servicio a continuación."}
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {business.phone}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 uppercase tracking-widest text-[10px] font-bold text-emerald-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Abierto Hoy
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* Services List */}
        <div className="md:col-span-2 space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-8">Servicios Disponibles</h2>
            <div className="space-y-4">
              {business.services.length > 0 ? (
                business.services.map((service) => (
                  <div 
                    key={service.id}
                    className="group bg-zinc-900/40 border border-white/[0.04] p-6 rounded-2xl hover:bg-zinc-900/60 hover:border-white/[0.08] transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg group-hover:text-white transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration_minutes} min
                        </span>
                        {service.price_display && (
                          <span className="font-mono text-zinc-400 italic">{service.price_display}</span>
                        )}
                      </div>
                    </div>
                    <BookingButton 
                      className="px-5 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
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
        <div className="space-y-10">
          <div className="bg-zinc-900/30 border border-white/[0.04] p-8 rounded-3xl sticky top-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Horarios
            </h2>
            <div className="space-y-4">
              {DAYS.map((day, index) => {
                const hour = business.business_hours.find(h => h.day_of_week === index);
                return (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">{day}</span>
                    <span className={`font-medium ${hour?.is_closed ? 'text-zinc-700 italic' : 'text-zinc-300'}`}>
                      {hour?.is_closed 
                        ? "Cerrado" 
                        : hour 
                          ? `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`
                          : "No definido"
                      }
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-2">Ubicación</p>
              <p className="text-zinc-400 text-sm italic">{business.address || "Consultar por teléfono"}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto py-12 px-6 border-t border-white/5 flex items-center justify-between opacity-40">
        <p className="text-xs text-zinc-500">© 2026 {business.name}. Powered by Accord.</p>
        <div className="text-[10px] uppercase tracking-widest font-bold">Accord Platform</div>
      </footer>
    </div>
  );
}
