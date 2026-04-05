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

  // Mobile menu state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { 
      name: "Inicio", 
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: "Citas", 
      href: "/dashboard/appointments",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: "Servicios", 
      href: "/dashboard/services",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      name: "Horarios", 
      href: "/dashboard/hours",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Mobile Header (Hamburger) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.03)] -mt-4 -mx-4 relative z-10">
        <h2 className="font-bold text-text-main truncate text-xl leading-tight pr-4">{businessName}</h2>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-1 text-brand-blue hover:opacity-80 transition-opacity shrink-0 outline-none focus:outline-none"
          aria-label="Abrir menú"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Overlay background for Mobile */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-bg-surface border-r border-slate-200 flex flex-col h-full 
        transform transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
        md:relative md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "md:w-20" : "md:w-64"} w-64
      `}>
        
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden md:flex absolute -right-3 top-8 bg-white border border-slate-200 rounded-full w-6 h-6 items-center justify-center text-slate-400 hover:text-brand-blue shadow-sm z-10 transition-colors"
          aria-label="Alternar menú"
        >
          {isCollapsed ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>

        {/* Mobile Close Button inside Sidebar */}
        <div className="md:hidden absolute top-4 right-4">
          <button onClick={() => setIsMobileOpen(false)} className="p-2 text-text-muted hover:text-text-main rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Brand Area */}
        <div className={`pt-8 ${isCollapsed ? "px-0 flex flex-col items-center" : "px-6"} flex items-center gap-3 transition-padding duration-300`}>
          {hasBusiness && logoUrl ? (
            <img src={logoUrl} alt={businessName} className={`rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 transition-all ${isCollapsed ? "w-10 h-10" : "w-10 h-10"}`} />
          ) : (
            <div className={`bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm transition-all ${isCollapsed ? "w-10 h-10" : "w-10 h-10"}`}>
              <span className="text-sm font-bold text-brand-blue">{businessName[0].toUpperCase()}</span>
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden transition-all duration-300 opacity-100">
              <Link href="/dashboard" className="block hover:opacity-80 transition-opacity">
                <h1 className={`text-base font-bold tracking-tight text-text-main truncate w-40 ${!hasBusiness ? 'text-text-muted' : ''}`} title={businessName}>
                  {businessName}
                </h1>
              </Link>
              <p className="text-[10px] text-text-muted font-bold leading-none mt-0.5">
                {hasBusiness ? 'Dashboard' : 'Pendiente'}
              </p>
            </div>
          )}
        </div>
        
        {/* Pending Step Notification */}
        {!hasBusiness && !isCollapsed && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mx-5 mt-6 shadow-sm">
            <p className="text-[10px] text-brand-blue font-bold mb-1.5 leading-none">Paso pendiente</p>
            <Link 
              href="/dashboard"
              className="text-[11px] text-brand-blue font-bold hover:underline flex items-center gap-1 transition-colors"
            >
              Configurar negocio
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex flex-col gap-1.5 mt-8 ${isCollapsed ? "px-3" : "px-4"} overflow-y-auto overflow-x-hidden feel-smooth`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = !hasBusiness && item.href !== "/dashboard" && item.href !== "/dashboard/settings";
            
            return (
              <Link
                key={item.href}
                href={isDisabled ? "#" : item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 py-2.5 transition-all duration-200 text-sm font-medium
                  ${isCollapsed ? "justify-center rounded-xl px-0 w-12 h-12 mx-auto" : "px-4 rounded-xl"} 
                  ${
                  isActive
                    ? "bg-blue-50 text-brand-blue border-l-4 border-brand-blue rounded-l-none"
                    : "text-text-muted hover:text-text-main hover:bg-slate-50 border-l-4 border-transparent"
                } ${isDisabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
              >
                {item.icon}
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Settings & Logout */}
        <div className={`mt-auto flex flex-col pb-6 pt-4 border-t border-slate-100 ${isCollapsed ? "px-3 items-center gap-4" : "px-5 space-y-4"}`}>
          {/* Settings Nav Item */}
          <Link
            href="/dashboard/settings"
            title={isCollapsed ? "Configuración" : undefined}
            className={`flex items-center gap-3 transition-all duration-200 text-sm font-medium
              ${isCollapsed ? "justify-center w-12 h-12 rounded-xl text-text-muted hover:text-text-main hover:bg-slate-50" : "px-3 py-2 text-text-muted hover:text-text-main hover:bg-slate-50 rounded-xl"}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!isCollapsed && <span>Configuración</span>}
          </Link>

          {!isCollapsed && (
            <div className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col relative group">
              <p className="text-[10px] text-text-muted font-bold mb-0.5">Usuario</p>
              <p className="text-sm font-semibold text-text-main truncate" title={userName}>{userName}</p>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className={`group text-text-muted transition-all duration-300
              hover:bg-white active:bg-white 
              hover:text-red-500 active:text-red-500 
              hover:shadow-[0_4px_15px_rgba(239,68,68,0.15)] active:shadow-[0_4px_15px_rgba(239,68,68,0.15)]
              hover:-translate-y-px active:-translate-y-px
              ${isCollapsed 
                ? "flex items-center justify-center w-12 h-12 rounded-xl" 
                : "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"}`}
          >
            <svg className={`w-5 h-5 shrink-0 ${!isCollapsed && "group-hover:translate-x-1 group-active:translate-x-1 transition-transform"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="text-[11px] font-bold">Cerrar sesión</span>}
          </button>
        </div>

      </aside>
    </>
  );
}
