"use client";

import { useEffect, useState } from "react";

interface AppointmentDetailsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any | null;
  onStatusUpdate?: (id: number, newStatus: string) => void;
}

export default function AppointmentDetailsSlideOver({ isOpen, onClose, appointment, onStatusUpdate }: AppointmentDetailsSlideOverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 500);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleUpdateStatus = async (newStatus: string) => {
    if (!appointment) return;
    setIsUpdating(newStatus);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Error al actualizar el estado");

      if (onStatusUpdate) {
        onStatusUpdate(appointment.id, newStatus);
      }
    } catch (err) {
      alert("No se pudo actualizar el estado de la cita.");
    } finally {
      setIsUpdating(null);
    }
  };

  const statusDictionary: Record<string, { label: string, colorClass: string }> = {
    pending: { label: "Pendiente", colorClass: "text-white bg-amber-500 border-amber-400 shadow-[0_8px_20px_rgba(245,158,11,0.3)]" },
    approved: { label: "Confirmada", colorClass: "text-white bg-emerald-500 border-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.3)]" },
    completed: { label: "Completada", colorClass: "text-white bg-brand-blue border-brand-blue/90 shadow-[0_8px_20px_rgba(46,167,237,0.3)]" },
    cancelled: { label: "Cancelada", colorClass: "text-white bg-red-500 border-red-400 shadow-[0_8px_20px_rgba(239,68,68,0.3)]" },
  };

  const currentStatus = appointment?.status || "pending";
  const statusDisplay = statusDictionary[currentStatus] || { label: currentStatus, colorClass: "text-gray-700 bg-gray-50 border-gray-100 shadow-sm" };

  const formattedDate = appointment 
    ? new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date(appointment.appointment_datetime))
    : "";
  
  const timeString = appointment 
    ? new Date(appointment.appointment_datetime).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true }) 
    : "";

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={onClose}
      />
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-full md:w-96 bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-text-main">Detalles de la cita</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-text-main hover:bg-slate-50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {appointment && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
            {/* Sec 1: Cabecera Cliente */}
            <div>
              <h3 className="text-2xl font-bold text-text-main mb-4">{appointment.client_name}</h3>
              <span className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-bold border-2 ${statusDisplay.colorClass} transition-all duration-500`}>
                {statusDisplay.label}
              </span>
            </div>

            {/* Sec 2: Acciones Rápidas */}
            <div className="flex items-center gap-3">
              {appointment.client_phone ? (
                <>
                  <a 
                    href={`https://wa.me/${appointment.client_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a 
                    href={`tel:${appointment.client_phone}`}
                    className="flex shrink-0 items-center justify-center w-11 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                </>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-400 py-2.5 rounded-xl text-sm font-medium border border-slate-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Sin teléfono registrado
                </div>
              )}
            </div>

            {/* Sec 3: Info & Notes */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-text-muted font-bold mb-0.5 capitalize">{formattedDate}</p>
                  <p className="text-xl font-bold text-text-main tracking-tight">{timeString}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-bold mb-0.5">Servicio</p>
                  <p className="text-base font-semibold text-text-main">{appointment.services?.name || "Sin especificar"}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-text-muted font-bold mb-2">Notas del cliente</p>
                {appointment.notes ? (
                  <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-200 shadow-inner min-h-[100px]">
                    {appointment.notes}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-8">
                    <svg className="w-6 h-6 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-slate-400 font-medium">No hay notas para esta cita.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}

        {/* Sec 4: Bottom Actions */}
        {appointment && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto flex flex-col gap-3 shrink-0">
            {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
              <button 
                onClick={() => handleUpdateStatus('completed')}
                disabled={!!isUpdating}
                className="btn-primary w-full disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isUpdating === 'completed' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Actualizando...
                  </>
                ) : 'Marcar como completada'}
              </button>
            )}
            {currentStatus !== 'cancelled' && (
              <button 
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={!!isUpdating}
                className="w-full py-2.5 text-red-500 font-bold text-xs transition-all duration-300 rounded-xl hover:bg-white active:bg-white hover:text-red-500 active:text-red-500 hover:shadow-[0_4px_15px_rgba(239,68,68,0.15)] active:shadow-[0_4px_15px_rgba(239,68,68,0.15)] hover:-translate-y-px active:-translate-y-px flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdating === 'cancelled' ? (
                  'Cancelando...'
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar cita
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
