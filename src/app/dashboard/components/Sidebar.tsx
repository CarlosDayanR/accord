"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userName: string;
}

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Inicio", href: "/dashboard" },
    { name: "Servicios", href: "/dashboard/services" },
    { name: "Horarios", href: "/dashboard/hours" },
    { name: "Configuración", href: "/dashboard/settings" },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 pr-4 flex flex-col gap-6 h-full">
      <div className="px-2">
        <Link href="/dashboard" className="block hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold tracking-tight">Accord Dashboard</h1>
        </Link>
        <p className="text-xs text-zinc-500">Gestión de Negocio</p>
      </div>
      
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white font-medium border border-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">Sesión activa</p>
          <p className="text-sm font-semibold truncate text-white">{userName}</p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full px-3 py-2 text-left text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all duration-200 flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
