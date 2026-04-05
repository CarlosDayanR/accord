import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateAppointment } from "@/lib/appointment-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const business = await prisma.businesses.findFirst({
      where: { user_id: userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const appointments = await prisma.appointments.findMany({
      where: { business_id: business.id },
      include: {
        services: true,
      },
      orderBy: { appointment_datetime: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const business = await prisma.businesses.findFirst({
      where: { user_id: userId },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { client_name, client_phone, service_id, appointment_datetime, notes } = body;

    if (!client_name || !service_id || !appointment_datetime) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // ─── Golden Rules Validation ─────────────────────────────
    const selectedDate = new Date(appointment_datetime);
    const validation = await validateAppointment(
      business.id,
      Number(service_id),
      selectedDate
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const appointment = await prisma.appointments.create({
      data: {
        business_id: business.id,
        service_id: Number(service_id),
        client_name,
        client_phone: client_phone || null,
        notes: notes || null,
        appointment_datetime: selectedDate,
        source: "manual",
        status: "approved",
      },
      include: {
        services: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 });
  }
}
