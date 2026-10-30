import React from 'react';
import { useCareX } from '../context/CareXContext';
import { Map2MedicLogo } from './Map2MedicLogo';
import { HeartPulse, ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setActiveRole, openAuthModal, isLoggedIn, activeRole, activeTab } = useCareX();

  if (isLoggedIn && activeRole === 'patient' && (activeTab === 'home' || activeTab === 'booking' || activeTab === 'orders')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pb-16">
      <div className="px-4 py-8 space-y-6">
        {/* Brand & Certifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Map2MedicLogo variant="light" size="sm" />
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Hospital-grade at-home healthcare. Certified B.Sc/GNM nurses, paramedics &amp; physiotherapists dispatched in 15–30 mins.
          </p>
          <div className="flex items-center gap-2 text-teal-400 text-[11px] font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>HIPAA Compliant · Medical Board Certified</span>
          </div>
        </div>

        {/* 24/7 Helpline Card */}
        <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Emergency &amp; Support</p>
            <p className="text-xs font-bold text-white">1-800-MAP2MEDIC</p>
          </div>
          <a
            href="tel:18002273963"
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[40px]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call SOS</span>
          </a>
        </div>

        {/* Quick Compact Links */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
          <button 
            onClick={() => setActiveTab('home')} 
            className="text-left text-slate-400 hover:text-teal-400 py-1.5 transition-colors cursor-pointer"
          >
            Services Catalog
          </button>
          <button 
            onClick={() => setActiveTab('nearby')} 
            className="text-left text-slate-400 hover:text-teal-400 py-1.5 transition-colors cursor-pointer"
          >
            Live Demand Map
          </button>
          <button 
            onClick={() => { setActiveRole('patient'); setActiveTab('patient-portal'); }} 
            className="text-left text-slate-400 hover:text-teal-400 py-1.5 transition-colors cursor-pointer"
          >
            Patient Portal
          </button>
          <button 
            onClick={() => { setActiveRole('provider'); setActiveTab('provider-portal'); }} 
            className="text-left text-slate-400 hover:text-teal-400 py-1.5 transition-colors cursor-pointer"
          >
            Provider Hub
          </button>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-2">
          <p>© 2026 Map2Medic Health Technologies. All rights reserved.</p>
          <p className="leading-normal">
            Map2Medic provides certified doorstep medical care. In life-threatening emergencies, call 911 or visit the nearest ER immediately.
          </p>
        </div>
      </div>
    </footer>
  );
};
