"use client";

import { useState, useEffect } from "react";

const DAYS = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

interface Schedule {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export default function HoursPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    fetch("/api/hours")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Map DB times (Dates) to HH:mm
          const mapped = data.map((s: any) => ({
            day_of_week: s.day_of_week,
            open_time: new Date(s.open_time).toISOString().substring(11, 16),
            close_time: new Date(s.close_time).toISOString().substring(11, 16),
            is_closed: s.is_closed
          }));
          setSchedules(mapped);
        } else {
          // Initialize default
          const initial = [0, 1, 2, 3, 4, 5, 6].map(day => ({
            day_of_week: day,
            open_time: "09:00",
            close_time: "18:00",
            is_closed: day >= 5 // Sat/Sun closed by default
          }));
          setSchedules(initial);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = (day: number) => {
    setSchedules(prev => prev.map(s => 
      s.day_of_week === day ? { ...s, is_closed: !s.is_closed } : s
    ));
  };

  const handleTimeChange = (day: number, field: "open_time" | "close_time", value: string) => {
    setSchedules(prev => prev.map(s => 
      s.day_of_week === day ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Horarios guardados correctamente." });
      } else {
        throw new Error();
      }
    } catch {
      setMessage({ type: "error", text: "Error al guardar los horarios." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-text-muted">Cargando horarios...</div>;

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-geist tracking-tight text-text-main">Horarios de Atención</h1>
        <p className="text-text-muted">Configura los días y horas en los que tu negocio recibe clientes.</p>
      </div>

      <div className="card !p-0 shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          {schedules.map((schedule, index) => (
            <div 
              key={schedule.day_of_week} 
              className={`flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-2xl transition-all duration-300 ${
                schedule.is_closed ? "bg-text-muted/5 opacity-60" : "bg-bg-base border border-surface-border"
              }`}
            >
              <div className="flex items-center gap-4 w-full md:w-48">
                <button
                  onClick={() => handleToggle(schedule.day_of_week)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    !schedule.is_closed ? "bg-brand-blue" : "bg-surface-border"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      !schedule.is_closed ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`font-bold ${!schedule.is_closed ? "text-text-main" : "text-text-muted"}`}>
                  {DAYS[index]}
                </span>
              </div>

              {!schedule.is_closed ? (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-2">
                    <span className="input-label !mb-0">Abre</span>
                    <input
                      type="time"
                      value={schedule.open_time}
                      onChange={(e) => handleTimeChange(schedule.day_of_week, "open_time", e.target.value)}
                      className="input-field !py-1.5"
                    />
                  </div>
                  <div className="w-4 h-px bg-surface-border mt-1" />
                  <div className="flex items-center gap-2">
                    <span className="input-label !mb-0">Cierra</span>
                    <input
                      type="time"
                      value={schedule.close_time}
                      onChange={(e) => handleTimeChange(schedule.day_of_week, "close_time", e.target.value)}
                      className="input-field !py-1.5"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-text-muted font-medium italic">
                  Cerrado para citas
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-8 bg-bg-base border-t border-surface-border flex items-center justify-between">
          <div>
            {message && (
              <p className={`text-sm font-medium ${message.type === "success" ? "text-emerald-500" : "text-red-500"} animate-in fade-in duration-300`}>
                {message.text}
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-8 py-3"
          >
            {isSaving ? "Guardando..." : "Guardar horario semanal"}
          </button>
        </div>
      </div>
    </div>
  );
}
