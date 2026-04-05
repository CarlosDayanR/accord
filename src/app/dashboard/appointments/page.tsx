"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Service {
  id: number;
  name: string;
}

interface Appointment {
  id: number;
  client_name: string;
  client_phone: string | null;
  appointment_datetime: string;
  status: string;
  notes: string | null;
  services: {
    name: string;
  };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [apptsRes, svcsRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/services"),
      ]);
      
      const apptsData = await apptsRes.json();
      const svcsData = await svcsRes.json();
      
      if (apptsRes.ok) setAppointments(apptsData);
      if (svcsRes.ok) setServices(svcsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullDatetime = `${formData.appointment_date}T${formData.appointment_time}:00`;
    const selectedDate = new Date(fullDatetime);
    const now = new Date();

    if (selectedDate < now) {
      setError("La fecha y hora de la cita no pueden ser en el pasado.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          service_id: formData.service_id,
          appointment_datetime: fullDatetime,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la cita.");
      }

      setAppointments([data, ...appointments]);
      setFormData({
        client_name: "",
        client_phone: "",
        service_id: "",
        appointment_date: "",
        appointment_time: "",
        notes: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar el estado.");
      }

      // Update local state
      setAppointments(prev => 
        prev.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt)
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getWhatsAppLink = (phone: string | null) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-main">Agenda de Citas</h1>
        <p className="text-text-muted">Gestiona las citas programadas y registra visitas manuales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Manual Appointment Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8">
            <h2 className="text-lg font-bold text-text-main mb-4">Registro manual</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="input-label">Nombre del Cliente</label>
                <input
                  type="text"
                  name="client_name"
                  required
                  value={formData.client_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="space-y-1">
                <label className="input-label">Teléfono</label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: 52 1 234 567 8900"
                />
              </div>

              <div className="space-y-1">
                <label className="input-label">Servicio</label>
                <select
                  name="service_id"
                  required
                  value={formData.service_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>{svc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="input-label">Fecha</label>
                <input
                  type="date"
                  name="appointment_date"
                  required
                  value={formData.appointment_date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="space-y-1">
                <label className="input-label">Hora</label>
                <input
                  type="time"
                  name="appointment_time"
                  required
                  value={formData.appointment_time}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="space-y-1">
                <label className="input-label">Notas internas (Opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Ej: Dejó anticipo de $150, traer cartilla de vacunación, etc."
                />
              </div>

              {error && (
                <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20 italic">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 mt-2"
              >
                {isSubmitting ? "Registrando..." : "Registrar cita"}
              </button>
            </form>
          </div>
        </div>

        {/* Appointment List Container */}
        <div className="lg:col-span-3">
          <div className="card !p-0 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-surface border-b border-surface-border text-text-muted text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Fecha y Hora</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Servicio</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-text-muted">
                        Cargando citas...
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-text-muted">
                        No hay citas registradas aún.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-main">
                            {format(new Date(appt.appointment_datetime), "dd MMM, yyyy", { locale: es })}
                          </div>
                          <div className="text-xs text-text-muted font-medium">
                            {format(new Date(appt.appointment_datetime), "hh:mm a", { locale: es })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-main">{appt.client_name}</div>
                          <div className="text-xs text-text-muted font-medium">{appt.client_phone || "Sin teléfono"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-brand-blue/10 border border-brand-blue/20 px-2.5 py-1 rounded-md text-[11px] font-bold text-brand-blue">
                            {appt.services.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={appt.status}
                            onChange={(e) => handleStatusUpdate(appt.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-bold border outline-none transition-all cursor-pointer shadow-md ${
                              appt.status === "completed" ? "text-white bg-brand-blue border-brand-blue/90 shadow-[0_4px_12px_rgba(46,167,237,0.25)]" :
                              appt.status === "cancelled" ? "text-white bg-red-500 border-red-400 shadow-[0_4px_12px_rgba(239,68,68,0.25)]" :
                              appt.status === "approved" ? "text-white bg-emerald-50 border-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.25)]" :
                              "text-white bg-amber-500 border-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
                            }`}
                          >
                            <option value="pending" className="bg-white text-amber-700">Pendiente</option>
                            <option value="approved" className="bg-white text-emerald-700">Confirmada</option>
                            <option value="completed" className="bg-white text-blue-700">Completada</option>
                            <option value="cancelled" className="bg-white text-red-700">Cancelada</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {appt.client_phone && (
                              <a
                                href={getWhatsAppLink(appt.client_phone) || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
