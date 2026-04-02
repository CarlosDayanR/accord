"use client";

import { useState } from "react";

interface BookingButtonProps {
  className?: string;
  serviceId: number;
  serviceName: string;
  businessId: number;
}

export default function BookingButton({ className, serviceId, serviceName, businessId }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    appointment_datetime: "",
    client_name: "",
    client_phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (!formData.appointment_datetime) {
      setError("Por favor, elige una fecha y hora.");
      return;
    }
    
    if (new Date(formData.appointment_datetime) < new Date()) {
      setError("No puedes agendar en el pasado.");
      return;
    }

    setError(null);
    setStep(2);
  };

  const resetFlow = () => {
    setIsOpen(false);
    setStep(1);
    setSuccess(false);
    setError(null);
    setFormData({
      appointment_datetime: "",
      client_name: "",
      client_phone: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          business_id: businessId,
          service_id: serviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al agendar la cita.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-zinc-900 border border-emerald-500/20 rounded-3xl p-8 text-center shadow-2xl shadow-emerald-500/5">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">¡Reserva Solicitada!</h3>
          <p className="text-zinc-400 text-sm mb-8">Hemos recibido tu solicitud para <span className="text-white font-semibold">{serviceName}</span>. El negocio revisará tu cita pronto.</p>
          <button 
            onClick={resetFlow}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all font-mono uppercase tracking-widest text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={className}
      >
        Agendar Cita
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in transition-all">
          <div className="max-w-lg w-full bg-zinc-900 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/[0.05] flex items-center justify-between bg-zinc-950/50">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Agendar Servicio:</p>
                <h3 className="text-xl font-bold tracking-tight">{serviceName}</h3>
              </div>
              <button 
                onClick={resetFlow}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {step === 1 ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-lg font-bold">1. Selecciona el Momento</h4>
                  <p className="text-sm text-zinc-400">Elige la fecha y hora que mejor te convenga.</p>
                  
                  <div className="relative">
                    <input 
                      type="datetime-local" 
                      name="appointment_datetime"
                      value={formData.appointment_datetime}
                      onChange={handleChange}
                      className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 text-sm text-white focus:border-white/40 outline-none transition-all [color-scheme:dark] appearance-none"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 italic pb-2">Error: {error}</p>}

                  <button 
                    onClick={nextStep}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98] mt-4"
                  >
                    Siguiente: Mis Datos
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-lg font-bold">2. Tus Datos de Contacto</h4>
                  <p className="text-sm text-zinc-400">¿A quién debemos esperar? Recibirás una notificación pronto.</p>

                  <div className="space-y-4">
                    <input 
                      type="text" 
                      name="client_name"
                      placeholder="Nombre Completo"
                      required
                      value={formData.client_name}
                      onChange={handleChange}
                      className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 text-sm text-white focus:border-white/40 outline-none transition-all"
                    />
                    <input 
                      type="tel" 
                      name="client_phone"
                      placeholder="Teléfono (WhatsApp)"
                      required
                      value={formData.client_phone}
                      onChange={handleChange}
                      className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 text-sm text-white focus:border-white/40 outline-none transition-all"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 italic pb-2">Error: {error}</p>}

                  <div className="flex gap-4 pt-2">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all font-mono text-xs uppercase"
                    >
                      Atrás
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? "Agendando..." : "Confirmar Cita"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
