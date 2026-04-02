"use client";

import { useState, useEffect } from "react";

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  buffer_minutes: number;
  price_display: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for Edit Modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    name: "",
    duration_minutes: "30",
    buffer_minutes: "0",
    price_display: "",
  });

  const [createFormData, setCreateFormData] = useState({
    name: "",
    duration_minutes: "30",
    buffer_minutes: "0",
    price_display: "",
  });

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (res.ok) {
        setServices(data);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el servicio.");

      setServices([data, ...services]);
      setCreateFormData({
        name: "",
        duration_minutes: "30",
        buffer_minutes: "0",
        price_display: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setModalFormData({
      name: service.name,
      duration_minutes: String(service.duration_minutes),
      buffer_minutes: String(service.buffer_minutes || 0),
      price_display: service.price_display || "",
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/services/${editingService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar.");

      setServices(services.map(s => s.id === editingService.id ? data : s));
      setIsModalOpen(false);
      setEditingService(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Gestión de Servicios</h1>
        <p className="text-zinc-500">Define los servicios que ofreces a tus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Create Form Container */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl sticky top-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-lg font-bold mb-4 text-white">Añadir Nuevo Servicio</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Nombre</label>
                <input
                  type="text"
                  required
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="Ej: Corte de Cabello"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Minutos</label>
                  <input
                    type="number"
                    required
                    value={createFormData.duration_minutes}
                    onChange={(e) => setCreateFormData({ ...createFormData, duration_minutes: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Buffer</label>
                  <input
                    type="number"
                    value={createFormData.buffer_minutes}
                    onChange={(e) => setCreateFormData({ ...createFormData, buffer_minutes: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Precio (Display)</label>
                <input
                  type="text"
                  value={createFormData.price_display}
                  onChange={(e) => setCreateFormData({ ...createFormData, price_display: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-700"
                  placeholder="Ej: $250.00"
                />
              </div>

              {error && (
                <div className="text-[10px] text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 italic font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {isSubmitting ? "Guardando..." : "Crear Servicio"}
              </button>
            </form>
          </div>
        </div>

        {/* List Container */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-in fade-in duration-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-5">Servicio</th>
                  <th className="px-6 py-5">Duración</th>
                  <th className="px-6 py-5">Precio</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-700 font-medium italic">
                      Cargando servicios...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-700 font-medium italic">
                      No hay servicios registrados aún.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5 font-bold text-white tracking-tight">{service.name}</td>
                      <td className="px-6 py-5 text-zinc-400">
                        {service.duration_minutes} min 
                        {service.buffer_minutes > 0 && (
                          <span className="text-zinc-600 text-xs ml-1 font-medium">(+ {service.buffer_minutes} buffer)</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-emerald-500 font-mono font-bold italic">
                        {service.price_display || "N/A"}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleEditClick(service)}
                          className="px-3 py-1.5 bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white hover:text-black transition-all"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold mb-2 text-white">Editar Servicio</h2>
            <p className="text-zinc-500 text-sm mb-6">Modifica los detalles actuales del servicio.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={modalFormData.name}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Duración (min)</label>
                  <input
                    type="number"
                    required
                    value={modalFormData.duration_minutes}
                    onChange={(e) => setModalFormData({ ...modalFormData, duration_minutes: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Buffer (min)</label>
                  <input
                    type="number"
                    value={modalFormData.buffer_minutes}
                    onChange={(e) => setModalFormData({ ...modalFormData, buffer_minutes: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Precio a Mostrar</label>
                <input
                  type="text"
                  value={modalFormData.price_display}
                  onChange={(e) => setModalFormData({ ...modalFormData, price_display: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl hover:bg-zinc-700 transition-all uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
                >
                  {isSubmitting ? "..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

