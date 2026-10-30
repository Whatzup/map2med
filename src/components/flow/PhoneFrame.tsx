import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  screenNumber?: number;
  screenLabel?: string;
  isActive?: boolean;
  scale?: number;
  className?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  screenNumber,
  screenLabel,
  isActive = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Screen Title Label matching reference image (e.g. SCREEN 1) */}
      {screenNumber && (
        <div className="mb-2 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100/90 px-3 py-1 rounded-md border border-slate-200">
            {screenLabel || `SCREEN ${screenNumber}`}
          </span>
        </div>
      )}

      {/* Realistic Phone Body */}
      <div
        className={`relative w-[340px] sm:w-[360px] h-[720px] bg-slate-900 rounded-[44px] p-3 shadow-2xl transition-all duration-300 border-[3.5px] ${
          isActive
            ? 'border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
            : 'border-slate-800 shadow-slate-900/40'
        }`}
      >
        {/* Subtle phone buttons on sides */}
        <div className="absolute -left-[5px] top-28 w-[3px] h-10 bg-slate-700 rounded-l-md"></div>
        <div className="absolute -left-[5px] top-42 w-[3px] h-10 bg-slate-700 rounded-l-md"></div>
        <div className="absolute -right-[5px] top-32 w-[3px] h-14 bg-slate-700 rounded-r-md"></div>

        {/* Screen Bezel & Display */}
        <div className="relative w-full h-full bg-[#f8faf9] rounded-[34px] overflow-hidden flex flex-col border border-slate-700/60 shadow-inner">
          {/* Top Status Bar with Punch-hole Camera */}
          <div className="w-full h-7 bg-white flex items-center justify-between px-5 pt-1 text-[11px] font-semibold text-slate-800 select-none z-30 shrink-0">
            <span>9:41</span>

            {/* Front Camera Punch-hole */}
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 fill-slate-700" />
            </div>
          </div>

          {/* Screen Content Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative scrollbar-thin">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-full h-4 bg-white flex items-center justify-center shrink-0 z-30">
            <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
