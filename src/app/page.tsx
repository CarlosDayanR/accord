import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-white/[0.015] rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400 font-medium">Plataforma en desarrollo activo</span>
        </div>

        {/* Title */}
        <h1 className="text-7xl sm:text-8xl font-bold text-white tracking-tighter mb-6 leading-none">
          Accord
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 mb-4 leading-relaxed max-w-lg mx-auto">
          El sistema operativo de tu tiempo.
        </p>
        <p className="text-sm text-gray-600 mb-12 max-w-md mx-auto">
          Gestiona citas, servicios y clientes desde una sola plataforma.
          Tu negocio, organizado y automatizado.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-white text-black font-semibold rounded-lg px-8 py-3 text-sm hover:bg-gray-200 active:scale-[0.98] transition-all duration-150 inline-block text-center"
          >
            Registrar mi Negocio
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-white/[0.04] border border-white/[0.08] text-white font-medium rounded-lg px-8 py-3 text-sm hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-[0.98] transition-all duration-150 inline-block text-center"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      {/* Bottom subtle line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}