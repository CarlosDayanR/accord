import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, slug, phone, address, description, theme_palette, policies, subcategory_id } = body;

    // Basic validation
    if (!name || !slug || !phone || !address || !subcategory_id) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    // Check if slug is already in use
    const existingBusiness = await prisma.businesses.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "Este enlace ya está en uso." },
        { status: 400 }
      );
    }

    // Check if user already has a business (rule: one per user for now)
    const userId = Number((session.user as any).id);
    const userBusiness = await prisma.businesses.findFirst({
      where: { user_id: userId },
    });

    if (userBusiness) {
      return NextResponse.json(
        { error: "Ya tienes un negocio registrado." },
        { status: 400 }
      );
    }

    // Create the business
    const business = await prisma.businesses.create({
      data: {
        user_id: userId,
        subcategory_id: Number(subcategory_id),
        name,
        slug: slug.toLowerCase(),
        phone,
        address,
        description: description || null,
        theme_palette: theme_palette || "classic_light",
        policies: policies || "",
      },
    });

    return NextResponse.json(
      { message: "Negocio creado exitosamente.", business },
      { status: 201 }
    );
  } catch (error) {
    console.error("Business creation error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar el negocio." },
      { status: 500 }
    );
  }
}
