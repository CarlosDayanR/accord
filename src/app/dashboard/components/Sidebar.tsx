"use client";

import { useState, useEffect } from "react";
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

  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Header (Hamburger) */}
      <div className="md:hidden flex items-center justify-between mb-4 mt-2">
        <h2 className="font-bold text-text-main truncate text-lg">{businessName}</h2>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white border border-surface-border rounded-lg text-text-main hover:bg-zinc-50 transition-colors shadow-sm"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Overlay background for Mobile */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bg-surface md:bg-transparent border-r border-surface-border flex flex-col gap-6 h-full p-6 md:p-0 md:pr-4 
        transform transition-transform duration-300 shadow-2xl md:shadow-none
        md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile Close Button inside Sidebar */}
        <div className="md:hidden absolute top-4 right-4">
          <button onClick={() => setIsOpen(false)} className="p-2 text-text-muted hover:text-text-main rounded-lg hover:bg-zinc-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
            Configurar negocio
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
          <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Cerrar sesión</span>
        </button>
      </div>
    </aside>
    </>
  );
}
