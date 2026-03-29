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
    const { name, duration_minutes, buffer_minutes, price_display } = body;

    // Verify service ownership
    const serviceId = Number(id);
    const existingService = await prisma.services.findFirst({
      where: { 
        id: serviceId,
        business_id: business.id 
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Servicio no encontrado o no pertenece al negocio" }, { status: 404 });
    }

    const updatedService = await prisma.services.update({
      where: { id: serviceId },
      data: {
        name: name || undefined,
        duration_minutes: duration_minutes ? Number(duration_minutes) : undefined,
        buffer_minutes: buffer_minutes !== undefined ? Number(buffer_minutes) : undefined,
        price_display: price_display !== undefined ? price_display : undefined,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Error al actualizar el servicio" }, { status: 500 });
  }
}
