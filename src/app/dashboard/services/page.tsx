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

  const formatPriceStandard = (price: string | null) => {
    if (!price) return "N/A";
    const num = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return price;
    if (num === 0) return "Gratis";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const cleanPrice = (price: string) => {
    return price.replace(/[^0-9.]/g, "").trim();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...createFormData,
        price_display: cleanPrice(createFormData.price_display),
      };

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      const payload = {
        ...modalFormData,
        price_display: cleanPrice(modalFormData.price_display),
      };

      const res = await fetch(`/api/services/${editingService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Gestión de Servicios</h1>
        <p className="text-text-muted">Define los servicios que ofreces a tus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Create Form Container */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8 animate-in fade-in slide-in-from-left-4 duration-500 cursor-default">
            <h2 className="text-lg font-bold mb-4 text-text-main">Añadir nuevo servicio</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="input-label">Nombre</label>
                <input
                  type="text"
                  required
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Corte de Cabello"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="input-label">Minutos</label>
                  <input
                    type="number"
                    required
                    value={createFormData.duration_minutes}
                    onChange={(e) => setCreateFormData({ ...createFormData, duration_minutes: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1">
                  <label className="input-label">Buffer</label>
                  <input
                    type="number"
                    value={createFormData.buffer_minutes}
                    onChange={(e) => setCreateFormData({ ...createFormData, buffer_minutes: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="input-label">Precio (Display)</label>
                <input
                  type="text"
                  value={createFormData.price_display}
                  onChange={(e) => setCreateFormData({ ...createFormData, price_display: e.target.value })}
                  className="input-field"
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
                className="btn-primary w-full py-3 mt-2"
              >
                {isSubmitting ? "Guardando..." : "Crear servicio"}
              </button>
            </form>
          </div>
        </div>

        {/* List Container */}
        <div className="lg:col-span-2">
          <div className="card !p-0 shadow-sm overflow-hidden animate-in fade-in duration-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-surface border-b border-surface-border text-text-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-5">Servicio</th>
                  <th className="px-6 py-5">Duración</th>
                  <th className="px-6 py-5">Precio</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted font-medium italic">
                      Cargando servicios...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted font-medium italic">
                      No hay servicios registrados aún.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-6 py-5 font-bold text-text-main tracking-tight">{service.name}</td>
                      <td className="px-6 py-5 text-text-muted font-medium">
                        {service.duration_minutes} min 
                        {service.buffer_minutes > 0 && (
                          <span className="text-text-muted/60 text-xs ml-1 font-medium">(+ {service.buffer_minutes} buffer)</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-emerald-600 font-mono font-bold italic">
                        {formatPriceStandard(service.price_display)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleEditClick(service)}
                          className="btn-secondary px-3 py-1.5 !rounded-lg text-[10px]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-bg-base border border-surface-border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold mb-2 text-text-main">Editar servicio</h2>
            <p className="text-text-muted text-sm mb-6">Modifica los detalles actuales del servicio.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="input-label">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={modalFormData.name}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="input-label">Duración (min)</label>
                  <input
                    type="number"
                    required
                    value={modalFormData.duration_minutes}
                    onChange={(e) => setModalFormData({ ...modalFormData, duration_minutes: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="input-label">Buffer (min)</label>
                  <input
                    type="number"
                    value={modalFormData.buffer_minutes}
                    onChange={(e) => setModalFormData({ ...modalFormData, buffer_minutes: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="input-label">Precio a Mostrar</label>
                <input
                  type="text"
                  value={modalFormData.price_display}
                  onChange={(e) => setModalFormData({ ...modalFormData, price_display: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1 py-3 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 py-3 text-xs"
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

