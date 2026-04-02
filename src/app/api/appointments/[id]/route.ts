import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Falta el campo status" }, { status: 400 });
    }

    // Verify appointment ownership
    const appointmentId = Number(id);
    const appointment = await prisma.appointments.findFirst({
      where: {
        id: appointmentId,
        business_id: business.id
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada o no pertenece al negocio" }, { status: 404 });
    }

    // Update status
    const updatedAppointment = await prisma.appointments.update({
      where: { id: appointmentId },
      data: { status }
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json({ error: "Error al actualizar la cita" }, { status: 500 });
  }
}
