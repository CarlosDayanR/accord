import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BusinessRegistrationForm from "./components/BusinessRegistrationForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number((session.user as any).id);

  // Check if user has a business
  const business = await prisma.businesses.findFirst({
    where: { user_id: userId },
    include: {
      business_subcategories: {
        include: {
          business_categories: true,
        },
      },
    },
  });

  // Fetch categories and subcategories for the registration form
  const categories = await prisma.business_categories.findMany({
    include: {
      business_subcategories: true,
    },
  });

  return (
    <>
      {!business ? (
        <div className="max-w-2xl mx-auto py-12">
          <BusinessRegistrationForm categories={categories} />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="mb-2">
            <h1 className="text-3xl font-bold mb-2">Bienvenido al panel de {business.name}</h1>
            <p className="text-zinc-400">Desde aquí podrás gestionar tus citas y servicios.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <p className="text-zinc-500 text-sm mb-1">Citas Hoy</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <p className="text-zinc-500 text-sm mb-1">Servicios Activos</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <p className="text-zinc-500 text-sm mb-1">Estado de Agenda</p>
              <p className="text-3xl font-bold text-green-500">Abierto</p>
            </div>
          </div>

          <div className="mt-4 p-12 border border-dashed border-zinc-800 rounded-3xl text-center flex flex-col items-center justify-center gap-4 bg-zinc-950/50">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-2">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-white mb-1">Aún no tienes citas registradas</p>
              <p className="text-zinc-500 text-sm max-w-sm">Configura tus servicios y horarios para comenzar a recibir reservas de tus clientes.</p>
            </div>
            <Link 
              href="/dashboard/services"
              className="mt-2 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Configurar mi primer servicio
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
