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
  onSkip?: () => void;
}

const MEXICO_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
  "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero",
  "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
  "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

export default function BusinessRegistrationForm({ categories, onSkip }: BusinessRegistrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    phone: "",
    description: "",
    theme_palette: "classic_dark",
    policies: "",
    subcategory_id: "",
  });

  const [addressDetails, setAddressDetails] = useState({
    street: "",
    ext_number: "",
    int_number: "",
    neighborhood: "",
    zip_code: "",
    city: "",
    state: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "slug") setError(null); // Clear slug error on change
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Concat address string: 'Calle 123 Int 4, Colonia Centro, C.P. 50000, Toluca, Estado de México'
    const fullAddress = `${addressDetails.street} ${addressDetails.ext_number}${addressDetails.int_number ? ' Int ' + addressDetails.int_number : ''}, Col. ${addressDetails.neighborhood}, C.P. ${addressDetails.zip_code}, ${addressDetails.city}, ${addressDetails.state}`;

    try {
      const response = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          address: fullAddress
        }),
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
    <div className="max-w-2xl mx-auto card p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Configura tu negocio</h2>
        </div>
        <p className="text-text-muted text-sm leading-relaxed">Completa estos datos para que tus clientes puedan descubrir tu negocio y agendar sus citas.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="name" className="input-label">Nombre comercial</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: Barbería Central"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="input-label">Crea el enlace de tu negocio</label>
            <div className="flex w-full group">
              <div className="flex items-center px-4 bg-bg-surface border-y border-l border-surface-border rounded-l-xl text-text-muted text-xs font-medium transition-colors group-focus-within:border-brand-blue whitespace-nowrap">
                accordapp.com/
              </div>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className={`flex-1 min-w-0 px-4 py-3 bg-bg-base border-y border-r ${error === "Este enlace ya está en uso." ? "border-red-500" : "border-surface-border"} rounded-r-xl text-text-main focus:border-brand-blue outline-none text-sm placeholder:text-text-muted`}
                placeholder="mi-negocio"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-surface-border pb-2">Ubicación detallada</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="input-label">Calle</label>
              <input
                type="text"
                name="street"
                required
                value={addressDetails.street}
                onChange={handleAddressChange}
                placeholder="Av. Paseo de los Leones"
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="input-label">Num ext.</label>
              <input
                type="text"
                name="ext_number"
                required
                value={addressDetails.ext_number}
                onChange={handleAddressChange}
                placeholder="101"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="input-label">Num int. (opcional)</label>
              <input
                type="text"
                name="int_number"
                value={addressDetails.int_number}
                onChange={handleAddressChange}
                placeholder="Local 4"
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="input-label">Colonia</label>
              <input
                type="text"
                name="neighborhood"
                required
                value={addressDetails.neighborhood}
                onChange={handleAddressChange}
                placeholder="Cumbres 3er Sector"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="input-label">C.P.</label>
              <input
                type="text"
                name="zip_code"
                required
                value={addressDetails.zip_code}
                onChange={handleAddressChange}
                placeholder="64610"
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="input-label">Ciudad / municipio</label>
              <input
                type="text"
                name="city"
                required
                value={addressDetails.city}
                onChange={handleAddressChange}
                placeholder="Monterrey"
                className="input-field"
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="input-label">Estado</label>
              <select
                name="state"
                required
                value={addressDetails.state}
                onChange={handleAddressChange}
                className="input-field h-[46px]"
              >
                <option value="">Selecciona</option>
                {MEXICO_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <div className="space-y-2">
            <label htmlFor="phone" className="input-label">WhatsApp / teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="+52 ..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subcategory_id" className="input-label">Categoría de negocio</label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              required
              value={formData.subcategory_id}
              onChange={handleChange}
              className="input-field h-[46px]"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.business_subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1 py-4"
          >
            {isLoading ? "Creando..." : "Crear mi negocio"}
          </button>
          
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="btn-secondary px-8 py-4 uppercase tracking-widest text-[10px]"
            >
              Configurar más tarde
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
