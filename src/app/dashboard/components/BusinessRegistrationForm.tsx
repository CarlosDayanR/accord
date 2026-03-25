"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Subcategory {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  business_subcategories: Subcategory[];
}

interface BusinessRegistrationFormProps {
  categories: Category[];
}

export default function BusinessRegistrationForm({ categories }: BusinessRegistrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    phone: "",
    theme_palette: "classic_dark",
    policies: "",
    subcategory_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "slug") setError(null); // Clear slug error on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al registrar el negocio.");
      }

      // Success! Refresh the page to show dashboard view
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 backdrop-blur-sm animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-white mb-2">Configura tu Negocio</h2>
      <p className="text-zinc-400 mb-8">Completa la información para comenzar a gestionar tus citas.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-zinc-300">Nombre del Negocio</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600"
              placeholder="Ej: Barbería Central"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-zinc-300">URL del Negocio (Slug)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-zinc-500">accord.com/</span>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className={`w-full pl-[98px] pr-4 py-2 bg-zinc-950 border ${error === "Este enlace ya está en uso." ? "border-red-500" : "border-zinc-800"} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600`}
                placeholder="mi-negocio"
              />
            </div>
            {error === "Este enlace ya está en uso." && (
              <p className="text-xs text-red-500 pt-1 font-medium italic animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-zinc-300">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
              placeholder="+52 ..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subcategory_id" className="text-sm font-medium text-zinc-300">Categoría del Negocio</label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              required
              value={formData.subcategory_id}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
            >
              <option value="">Selecciona una opción</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.business_subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="theme_palette" className="text-sm font-medium text-zinc-300">Paleta de Colores</label>
          <select
            id="theme_palette"
            name="theme_palette"
            value={formData.theme_palette}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
          >
            <option value="classic_dark">Premium Dark (Negro y Gris)</option>
            <option value="deep_ocean">Deep Ocean (Azul Marino)</option>
            <option value="forest_night">Forest Night (Verde Esmeralda Oscuro)</option>
            <option value="royal_gold">Royal Gold (Dorado sobre Negro)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="policies" className="text-sm font-medium text-zinc-300">Políticas y Términos (Opcional)</label>
          <textarea
            id="policies"
            name="policies"
            rows={3}
            value={formData.policies}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none placeholder:text-zinc-600"
            placeholder="Ej: Cancelaciones con 24h de anticipación..."
          />
        </div>

        {error && error !== "Este enlace ya está en uso." && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? "Registrando..." : (
            <span className="flex items-center justify-center gap-2">
              Finalizar Registro
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
