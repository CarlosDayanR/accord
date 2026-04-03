"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  businessName: string;
  logoUrl?: string | null;
  userName: string;
  hasBusiness: boolean;
}

export default function Sidebar({ businessName, logoUrl, userName, hasBusiness }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Inicio", href: "/dashboard" },
    { name: "Citas", href: "/dashboard/appointments" },
    { name: "Servicios", href: "/dashboard/services" },
    { name: "Horarios", href: "/dashboard/hours" },
    { name: "Configuración", href: "/dashboard/settings" },
  ];

  return (
    <aside className="w-64 border-r border-surface-border pr-4 flex flex-col gap-6 h-full">
      <div className="px-2 flex items-center gap-3">
        {hasBusiness && logoUrl ? (
          <img src={logoUrl} alt={businessName} className="w-8 h-8 rounded-lg object-cover border border-surface-border shadow-sm" />
        ) : (
          <div className="w-8 h-8 bg-brand-blue/10 rounded-lg border border-brand-blue/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-brand-blue uppercase">{businessName[0]}</span>
          </div>
        )}
        <div>
          <Link href="/dashboard" className="block hover:opacity-80 transition-opacity">
            <h1 className={`text-sm font-bold tracking-tight text-text-main truncate w-40 ${!hasBusiness ? 'text-text-muted' : ''}`}>
              {businessName}
            </h1>
          </Link>
          <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest leading-none">
            {hasBusiness ? 'Dashboard' : 'Pendiente'}
          </p>
        </div>
      </div>
      
      {!hasBusiness && (
        <div className="bg-brand-blue/10 border border-brand-blue/20 p-3 rounded-xl mx-2 shadow-sm">
          <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest mb-1.5 leading-none">Paso Pendiente</p>
          <Link 
            href="/dashboard"
            className="text-[11px] text-text-main font-bold hover:text-brand-blue hover:underline flex items-center gap-1 transition-colors"
          >
            Configurar Negocio
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isDisabled = !hasBusiness && item.href !== "/dashboard" && item.href !== "/dashboard/settings";
          
          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                isActive
                  ? "bg-brand-blue/10 text-brand-blue font-bold border border-brand-blue/20"
                  : "text-text-muted hover:text-text-main hover:bg-bg-surface"
              } ${isDisabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pb-4">
        <div className="p-4 bg-bg-surface border border-surface-border rounded-xl">
          <p className="text-[10px] text-text-muted mb-1 font-bold uppercase tracking-wider">Sesión activa</p>
          <p className="text-sm font-semibold truncate text-text-main">{userName}</p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full px-3 py-2 text-left text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
