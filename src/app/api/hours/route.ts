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

    const hours = await prisma.business_hours.findMany({
      where: { business_id: business.id },
      orderBy: { day_of_week: "asc" },
    });

    return NextResponse.json(hours);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener horarios" }, { status: 500 });
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
    const { schedules } = body; // Array of { day_of_week, open_time, close_time, is_closed }

    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 });
    }

    // Use a transaction to update all hours
    await prisma.$transaction(
      schedules.map((s: any) => 
        prisma.business_hours.upsert({
          where: {
            business_id_day_of_week: {
              business_id: business.id,
              day_of_week: s.day_of_week,
            },
          },
          update: {
            open_time: new Date(`1970-01-01T${s.open_time}:00Z`),
            close_time: new Date(`1970-01-01T${s.close_time}:00Z`),
            is_closed: s.is_closed,
          },
          create: {
            business_id: business.id,
            day_of_week: s.day_of_week,
            open_time: new Date(`1970-01-01T${s.open_time}:00Z`),
            close_time: new Date(`1970-01-01T${s.close_time}:00Z`),
            is_closed: s.is_closed,
          },
        })
      )
    );

    return NextResponse.json({ message: "Horarios actualizados exitosamente" });
  } catch (error) {
    console.error("Error saving hours:", error);
    return NextResponse.json({ error: "Error al guardar horarios" }, { status: 500 });
  }
}
