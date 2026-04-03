import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Content */}
      <div className="relative text-center max-w-2xl mx-auto">
        {/* Header Layout: Logo + Brand */}
        <div className="flex items-center justify-center gap-x-4 mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl" />
          <h1 className="text-6xl sm:text-7xl font-bold text-text-main tracking-tighter leading-none">
            Accord
          </h1>
        </div>

        {/* Subtitle & Description */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-text-main mb-6 tracking-tight">
          El control total de tu tiempo.
        </h2>
        
        <p className="text-base sm:text-lg text-text-muted mb-16 max-w-lg mx-auto leading-relaxed">
          Gestiona tus citas, servicios y clientes en un solo lugar.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="btn-primary"
            >
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="btn-primary w-full sm:w-auto"
              >
                Comienza gratis
              </Link>
              <Link
                href="/login"
                className="btn-pill-white w-full sm:w-auto"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom subtle line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-border/30 to-transparent" />
    </div>
  );
}