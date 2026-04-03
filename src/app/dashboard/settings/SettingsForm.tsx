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

const MEXICO_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
  "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero",
  "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
  "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

export default function SettingsForm({ business }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(!business.address);

  const [formData, setFormData] = useState({
    phone: business.phone,
    description: business.description || "",
    is_whatsapp: !!business.is_whatsapp,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressDetails((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError(null);

    let finalAddress = business.address;

    if (isEditingAddress) {
      if (!addressDetails.street || !addressDetails.ext_number || !addressDetails.neighborhood || !addressDetails.zip_code || !addressDetails.city || !addressDetails.state) {
        setError("Por favor completa todos los campos obligatorios de la dirección.");
        setIsLoading(false);
        return;
      }
      finalAddress = `${addressDetails.street} ${addressDetails.ext_number}${addressDetails.int_number ? ' Int ' + addressDetails.int_number : ''}, Col. ${addressDetails.neighborhood}, C.P. ${addressDetails.zip_code}, ${addressDetails.city}, ${addressDetails.state}`;
    }

    try {
      const res = await fetch("/api/business/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          address: finalAddress
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la configuración.");
      }

      setSuccess(true);
      if (isEditingAddress) setIsEditingAddress(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl card p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Placeholder */}
        <div className="flex flex-col gap-4">
          <label className="input-label">Logo del Negocio</label>
          <div className="group relative w-24 h-24 bg-bg-surface border-2 border-dashed border-surface-border rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-brand-blue transition-colors">
            <svg className="w-6 h-6 text-text-muted group-hover:text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-text-muted font-bold uppercase text-center px-2 leading-tight">Subir Logo Próximamente</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Detailed Address Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="input-label">Dirección del Negocio</label>
              {!isEditingAddress && (
                <button 
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:text-brand-blue-hover transition-colors"
                >
                  Modificar Dirección
                </button>
              )}
            </div>

            {!isEditingAddress ? (
              <div className="p-4 bg-bg-surface border border-surface-border rounded-xl">
                <p className="text-sm text-text-muted">{business.address || "No hay dirección registrada."}</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="input-label">Calle</label>
                    <input
                      type="text"
                      required
                      name="street"
                      value={addressDetails.street}
                      onChange={handleAddressChange}
                      placeholder="Av. Juárez"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="input-label">Num Ext.</label>
                    <input
                      type="text"
                      required
                      name="ext_number"
                      value={addressDetails.ext_number}
                      onChange={handleAddressChange}
                      placeholder="456"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="input-label">Num Int. (Opcional)</label>
                    <input
                      type="text"
                      name="int_number"
                      value={addressDetails.int_number}
                      onChange={handleAddressChange}
                      placeholder="Despacho 3"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="input-label">Colonia</label>
                    <input
                      type="text"
                      required
                      name="neighborhood"
                      value={addressDetails.neighborhood}
                      onChange={handleAddressChange}
                      placeholder="Centro"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="input-label">C.P.</label>
                    <input
                      type="text"
                      required
                      name="zip_code"
                      value={addressDetails.zip_code}
                      onChange={handleAddressChange}
                      placeholder="06000"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="input-label">Ciudad</label>
                    <input
                      type="text"
                      required
                      name="city"
                      value={addressDetails.city}
                      onChange={handleAddressChange}
                      placeholder="CDMX"
                      className="input-field"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="input-label">Estado</label>
                    <select
                      name="state"
                      value={addressDetails.state}
                      onChange={handleAddressChange}
                      className="input-field h-[46px]"
                    >
                      <option value="">Selecciona</option>
                      {MEXICO_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {business.address && (
                  <button 
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-text-main"
                  >
                    Mantener Dirección Actual
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="input-label">Teléfono Directo</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="input-field placeholder:text-text-muted"
              placeholder="Ej: +52 1 234 567 8900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="input-label">Descripción del Negocio</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="input-field resize-none placeholder:text-text-muted"
              placeholder="Cuenta a tus clientes un poco sobre lo que haces y tu experiencia..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_whatsapp: !prev.is_whatsapp }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_whatsapp ? 'bg-brand-blue' : 'bg-surface-border'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_whatsapp ? 'left-7' : 'left-1'}`} />
            </button>
            <span className="text-sm text-text-main font-medium">¿Este número recibe WhatsApp?</span>
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
          className="btn-primary w-full py-4 shadow-lg shadow-brand-blue/10"
        >
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
