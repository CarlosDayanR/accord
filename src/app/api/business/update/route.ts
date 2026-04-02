import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
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
    const { address, phone, description, is_whatsapp } = body;

    // Optional validation (e.g., minimum phone length or address specified)
    if (!phone) {
      return NextResponse.json({ error: "El teléfono es obligatorio." }, { status: 400 });
    }

    const updatedBusiness = await prisma.businesses.update({
      where: { id: business.id },
      data: {
        address: address || null,
        phone: phone,
        description: description || null,
        is_whatsapp: Boolean(is_whatsapp),
      },
    });

    return NextResponse.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business settings:", error);
    return NextResponse.json({ error: "Error al actualizar la configuración." }, { status: 500 });
  }
}
