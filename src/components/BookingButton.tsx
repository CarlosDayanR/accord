"use client";

interface BookingButtonProps {
  className?: string;
}

export default function BookingButton({ className }: BookingButtonProps) {
  return (
    <button 
      onClick={() => alert('Próximamente: Calendario de reservas')}
      className={className}
    >
      Agendar Cita
    </button>
  );
}
