import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number((session.user as any).id);

  const business = await prisma.businesses.findFirst({
    where: { user_id: userId },
    select: {
      address: true,
      phone: true,
      description: true,
      is_whatsapp: true,
    },
  });

  if (!business) {
    // If user somehow visits this but hasn't registered a business
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Configuración del Negocio</h1>
        <p className="text-text-muted">Actualiza la información pública de tu perfil.</p>
      </div>

      <SettingsForm business={business} />
    </div>
  );
}
