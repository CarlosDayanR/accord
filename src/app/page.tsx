import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-blue/5 border border-brand-blue/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-text-muted font-medium">Plataforma en desarrollo activo</span>
        </div>

        {/* Title */}
        <h1 className="text-7xl sm:text-8xl font-bold text-text-main tracking-tighter mb-6 leading-none">
          Accord
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-text-muted mb-4 leading-relaxed max-w-lg mx-auto">
          El sistema operativo de tu tiempo.
        </p>
        <p className="text-sm text-text-muted mb-12 max-w-md mx-auto">
          Gestiona citas, servicios y clientes desde una sola plataforma.
          Tu negocio, organizado y automatizado.
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
                Comienza Gratis
              </Link>
              <Link
                href="/login"
                className="btn-secondary w-full sm:w-auto"
              >
                Iniciar Sesión
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