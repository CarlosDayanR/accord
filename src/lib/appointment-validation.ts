import { prisma } from "@/lib/prisma";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an appointment against the three Golden Rules:
 * 1. No past dates
 * 2. Within business operating hours (including service duration + buffer)
 * 3. No overlapping with existing appointments
 */
export async function validateAppointment(
  business_id: number,
  service_id: number,
  appointment_datetime: Date
): Promise<ValidationResult> {
  // ─── Rule 1: No Past ───────────────────────────────────────
  const now = new Date();
  if (appointment_datetime < now) {
    return { valid: false, error: "No puedes programar citas en el pasado." };
  }

  // ─── Fetch the service to know duration + buffer ───────────
  const service = await prisma.services.findUnique({
    where: { id: service_id },
  });

  if (!service) {
    return { valid: false, error: "Servicio no encontrado." };
  }

  const totalSlotMinutes = service.duration_minutes + (service.buffer_minutes || 0);

  // Calculate appointment end time
  const appointmentStart = new Date(appointment_datetime);
  const appointmentEnd = new Date(appointmentStart.getTime() + totalSlotMinutes * 60 * 1000);

  // ─── Rule 2: Business Hours ────────────────────────────────
  // Convert JS day (Sun=0) to our schema (Mon=0 ... Sun=6)
  const jsDay = appointmentStart.getDay(); // 0=Sunday, 1=Monday...
  const schemaDay = (jsDay + 6) % 7;       // 0=Monday, 1=Tuesday... 6=Sunday

  const businessHours = await prisma.business_hours.findFirst({
    where: {
      business_id: business_id,
      day_of_week: schemaDay,
    },
  });

  if (!businessHours) {
    return { valid: false, error: "No hay horario definido para este día. Contacta al negocio." };
  }

  if (businessHours.is_closed) {
    return { valid: false, error: "El negocio no opera este día." };
  }

  // Extract HH:MM from the appointment and compare with business hours
  // business_hours open_time/close_time are stored as Time (1970-01-01TXXXX)
  const apptStartMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
  const apptEndMinutes = appointmentEnd.getHours() * 60 + appointmentEnd.getMinutes();

  // Parse business hours times (stored as UTC dates with time component)
  const openTimeUTC = new Date(businessHours.open_time);
  const closeTimeUTC = new Date(businessHours.close_time);
  const openMinutes = openTimeUTC.getUTCHours() * 60 + openTimeUTC.getUTCMinutes();
  const closeMinutes = closeTimeUTC.getUTCHours() * 60 + closeTimeUTC.getUTCMinutes();

  if (apptStartMinutes < openMinutes) {
    const openFormatted = formatMinutesToTime(openMinutes);
    return {
      valid: false,
      error: `La cita es antes de la hora de apertura (${openFormatted}).`,
    };
  }

  // Handle overnight edge: if appointment end crosses midnight, use raw minutes
  // For standard cases: appointment end must not exceed close time
  if (apptEndMinutes > closeMinutes) {
    const closeFormatted = formatMinutesToTime(closeMinutes);
    return {
      valid: false,
      error: `El servicio (${service.duration_minutes} min + ${service.buffer_minutes || 0} min buffer) excede el horario de cierre (${closeFormatted}). Elige una hora más temprana.`,
    };
  }

  // ─── Rule 3: Collision Detection ───────────────────────────
  // Get all non-cancelled appointments for this business on the same day
  const dayStart = new Date(appointmentStart);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(appointmentStart);
  dayEnd.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointments.findMany({
    where: {
      business_id: business_id,
      appointment_datetime: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        notIn: ["cancelled"],
      },
    },
    include: {
      services: true,
    },
  });

  for (const existing of existingAppointments) {
    const existStart = new Date(existing.appointment_datetime);
    const existTotalSlot = existing.services.duration_minutes + (existing.services.buffer_minutes || 0);
    const existEnd = new Date(existStart.getTime() + existTotalSlot * 60 * 1000);

    // Overlap condition: (newStart < existEnd) AND (newEnd > existStart)
    if (appointmentStart < existEnd && appointmentEnd > existStart) {
      const existStartStr = existStart.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const existEndStr = existEnd.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return {
        valid: false,
        error: `Ya hay una cita agendada de ${existStartStr} a ${existEndStr}. Elige otro horario.`,
      };
    }
  }

  return { valid: true };
}

/** Converts total minutes (e.g. 570) to "9:30 AM" format */
function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
