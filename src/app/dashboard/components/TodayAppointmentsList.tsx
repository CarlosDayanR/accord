"use client";

import { useState } from "react";
import CopyLinkButton from "./CopyLinkButton";
import AppointmentDetailsSlideOver from "./AppointmentDetailsSlideOver";

interface TodayAppointmentsListProps {
  appointments: any[];
  businessSlug: string;
}

export default function TodayAppointmentsList({ appointments: initialAppointments, businessSlug }: TodayAppointmentsListProps) {
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [appointments, setAppointments] = useState(initialAppointments);

  const statusDictionary: Record<string, string> = {
    pending: "Pendiente",
    approved: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  const handleStatusUpdate = (id: number, newStatus: string) => {
    setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt));
    if (selectedAppt && selectedAppt.id === id) {
      setSelectedAppt({ ...selectedAppt, status: newStatus });
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending": return "text-white bg-amber-500 border-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.3)]";
      case "approved": return "text-white bg-emerald-500 border-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.3)]";
      case "completed": return "text-white bg-brand-blue border-brand-blue/90 shadow-[0_4px_12px_rgba(46,167,237,0.3)]";
      case "cancelled": return "text-white bg-red-500 border-red-400 shadow-[0_4px_12px_rgba(239,68,68,0.3)]";
      default: return "text-gray-700 bg-gray-50 border-gray-100";
    }
  };

  return (
    <>
      {appointments.length === 0 ? (
        // ... rest of the empty state ...
        <div className="bg-white rounded-2xl border border-slate-100 py-16 px-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-bg-base rounded-full flex items-center justify-center border border-surface-border mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-text-main mb-1.5">No tienes citas programadas para hoy</p>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto leading-relaxed">¡Aprovecha para compartir tu enlace de reservas con tus clientes y llenar tu agenda!</p>
          <CopyLinkButton slug={businessSlug} />
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const timeString = new Date(appt.appointment_datetime).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            
            const displayStatus = statusDictionary[appt.status] || appt.status;
            
            return (
              <div 
                key={appt.id} 
                onClick={() => setSelectedAppt(appt)}
                className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                
                {/* Izquierda: Hora y Datos */}
                <div className="flex items-center gap-5">
                  <div className="shrink-0 w-24 text-center border-r border-slate-100 pr-5 transition-transform group-hover:scale-105">
                    <p className="text-base font-bold text-brand-blue tracking-tight">{timeString}</p>
                  </div>
                  <div>
                    <p className="text-text-main font-semibold text-lg group-hover:text-brand-blue transition-colors">{appt.client_name}</p>
                    <p className="text-text-muted text-sm mt-0.5 truncate max-w-[200px] sm:max-w-xs">{appt.services?.name || "Servicio no especificado"}</p>
                  </div>
                </div>
                
                {/* Derecha: Píldora y Acción */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
                  <span className={`w-28 text-center px-2 py-1.5 rounded-full text-xs font-bold border transition-all ${getStatusStyles(appt.status)}`}>
                    {displayStatus}
                  </span>
                  <button className="p-2 text-gray-400 group-hover:text-brand-blue group-hover:bg-brand-blue/5 transition-colors rounded-lg outline-none">
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

      {/* Slide-over component */}
      <AppointmentDetailsSlideOver 
        isOpen={!!selectedAppt} 
        onClose={() => setSelectedAppt(null)} 
        appointment={selectedAppt} 
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
