import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const services = await prisma.services.findMany({
      where: { business_id: business.id },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
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
    const { name, duration_minutes, buffer_minutes, price_display } = body;

    if (!name || !duration_minutes) {
      return NextResponse.json({ error: "Nombre y duración son obligatorios" }, { status: 400 });
    }

    const service = await prisma.services.create({
      data: {
        business_id: business.id,
        name,
        duration_minutes: Number(duration_minutes),
        buffer_minutes: Number(buffer_minutes) || 0,
        price_display: price_display || "",
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 });
  }
}
