"use client";

import { useState } from "react";
import BusinessRegistrationForm from "./BusinessRegistrationForm";

interface DashboardOnboardingProps {
  categories: any[];
}

export default function DashboardOnboarding({ categories }: DashboardOnboardingProps) {
  const [showForm, setShowForm] = useState(true);

  if (!showForm) {
    return (
      <div className="flex flex-col gap-8">
        <div className="mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-text-main">Bienvenido a Accord</h1>
          <p className="text-text-muted text-lg">Tu espacio de trabajo está casi listo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 grayscale">
          <div className="card p-6">
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Citas Hoy</p>
            <p className="text-4xl font-bold text-text-main">0</p>
          </div>
          <div className="card p-6">
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Citas Pendientes</p>
            <p className="text-4xl font-bold text-text-main">0</p>
          </div>
          <div className="card p-4 flex flex-col justify-center">
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Servicios Activos</p>
            <p className="text-2xl font-bold text-text-main">0</p>
          </div>
        </div>

        <div className="mt-8 card p-12 text-center flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center border border-brand-blue/20">
            <svg className="w-10 h-10 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-text-main">Activa tu negocio</h3>
            <p className="text-text-muted max-w-sm mx-auto">Para empezar a recibir citas y gestionar servicios, necesitamos los datos básicos de tu negocio.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary px-10 py-4 shadow-xl shadow-brand-blue/10"
          >
            Configurar negocio ahora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <BusinessRegistrationForm 
        categories={categories} 
        onSkip={() => setShowForm(false)} 
      />
    </div>
  );
}
