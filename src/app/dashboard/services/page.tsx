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

  const [formData, setFormData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "number" ? value.replace(/^0+/, "") : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el servicio.");
      }

      // Success
      setServices([data, ...services]);
      setFormData({
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

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
        <p className="text-zinc-400">Define los servicios que ofreces a tus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Container */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl sticky top-8">
            <h2 className="text-lg font-bold mb-4">Añadir Nuevo Servicio</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Nombre del Servicio</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-white/20 outline-none transition-all"
                  placeholder="Ej: Corte de Cabello"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 uppercase font-bold">Duración (min)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    required
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-white/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 uppercase font-bold">Buffer (min)</label>
                  <input
                    type="number"
                    name="buffer_minutes"
                    value={formData.buffer_minutes}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Precio (Mostrar)</label>
                <input
                  type="text"
                  name="price_display"
                  value={formData.price_display}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-white/20 outline-none transition-all"
                  placeholder="Ej: $250.00"
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
                className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar Servicio"}
              </button>
            </form>
          </div>
        </div>

        {/* List Container */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Duración</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">
                      Cargando servicios...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">
                      No hay servicios registrados aún.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{service.name}</td>
                      <td className="px-6 py-4 text-zinc-400">
                        {service.duration_minutes} min 
                        {service.buffer_minutes > 0 && (
                          <span className="text-zinc-600 text-xs ml-1">(+ {service.buffer_minutes} buffer)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-mono italic">
                        {service.price_display || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-zinc-500 hover:text-white transition-colors">
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
    </div>
  );
}
