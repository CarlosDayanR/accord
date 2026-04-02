"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  business: {
    address: string | null;
    phone: string;
    description: string | null;
    is_whatsapp: boolean | null;
  };
}

export default function SettingsForm({ business }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    address: business.address || "",
    phone: business.phone,
    description: business.description || "",
    is_whatsapp: !!business.is_whatsapp,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/business/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la configuración.");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Placeholder */}
        <div className="flex flex-col gap-4">
          <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Logo del Negocio</label>
          <div className="group relative w-24 h-24 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-zinc-700 transition-colors">
            <svg className="w-6 h-6 text-zinc-700 group-hover:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-zinc-600 font-bold uppercase text-center px-2 leading-tight">Subir Logo Próximamente</span>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
              <span className="text-[10px] text-white font-bold uppercase">No disponible</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Teléfono Directo</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-700"
              placeholder="Ej: +52 1 234 567 8900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Dirección Física</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-700"
              placeholder="Ej: Av. Reforma #123, Col. Centro"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Descripción del Negocio</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-all resize-none placeholder:text-zinc-700"
              placeholder="Cuenta a tus clientes un poco sobre lo que haces y tu experiencia..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_whatsapp: !prev.is_whatsapp }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_whatsapp ? 'bg-emerald-500' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_whatsapp ? 'left-7' : 'left-1'}`} />
            </button>
            <span className="text-sm text-zinc-400 font-medium">¿Este número recibe WhatsApp?</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bolt uppercase tracking-wider animate-in slide-in-from-top-1 duration-300">
            ✓ Configuración actualizada correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-white/5"
        >
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
