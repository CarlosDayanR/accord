import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAppointment } from "@/lib/appointment-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_id, service_id, client_name, client_phone, appointment_datetime } = body;

    // Basic field validation
    if (!business_id || !service_id || !client_name || !appointment_datetime) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    // Verify business/service exists
    const business = await prisma.businesses.findUnique({ where: { id: Number(business_id) } });
    if (!business) return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });

    const service = await prisma.services.findUnique({ where: { id: Number(service_id) } });
    if (!service) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });

    // ─── Golden Rules Validation ─────────────────────────────
    const selectedDate = new Date(appointment_datetime);
    const validation = await validateAppointment(
      Number(business_id),
      Number(service_id),
      selectedDate
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const appointment = await prisma.appointments.create({
      data: {
        business_id: Number(business_id),
        service_id: Number(service_id),
        client_name,
        client_phone: client_phone || null,
        appointment_datetime: selectedDate,
        source: "web",
        status: "pending",
      },
      include: { services: true },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating public booking:", error);
    return NextResponse.json({ error: "Error al crear la reserva." }, { status: 500 });
  }
}
