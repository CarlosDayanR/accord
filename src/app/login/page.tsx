"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Correo o contraseña incorrectos.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Ocurrió un error inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-surface flex items-center justify-center px-4">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10 animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-brand-blue tracking-tighter hover:opacity-80 transition-opacity">
              Accord
            </h1>
          </Link>
          <p className="mt-2 text-sm text-text-muted">
            Inicia sesión en tu cuenta.
          </p>
        </div>

        {/* Card */}
        <form
          method="POST"
          onSubmit={handleSubmit}
          className="card p-8 space-y-5"
        >
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 animate-[fadeIn_0.2s_ease-out]">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="input-label">
              Correo electrónico
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              className="input-field"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="input-label">
              Contraseña
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              placeholder="Tu contraseña"
              className="input-field"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center mt-6 text-sm text-text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-brand-blue font-semibold hover:text-brand-blue-hover transition-all">
            Registra tu negocio
          </Link>
        </p>
      </div>
    </div>
  );
}
