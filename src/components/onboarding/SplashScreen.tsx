import React, { useEffect } from 'react';
import { HeartHandshake, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  // Automatically transition after ~2 seconds or on tap
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div 
      onClick={onContinue}
      className="min-h-screen w-full bg-gradient-to-b from-[#073b34] via-[#052e28] to-[#041f1b] text-white flex flex-col justify-between overflow-hidden relative cursor-pointer select-none animate-in fade-in duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo & Typography Section */}
      <div className="relative z-10 flex flex-col items-center pt-16 sm:pt-20 px-6 text-center">
        {/* Fully Visible Logo */}
        <div className="relative group flex items-center justify-center">
          <div className="relative p-1">
            <img 
              src="/map2medic_logo.jpeg" 
              alt="Map2Medic Logo" 
              className="h-20 sm:h-24 w-auto object-contain rounded-2xl drop-shadow-[0_0_25px_rgba(16,185,129,0.65)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#073b34]"></span>
          </span>
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-2 mt-5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
            Map2Medic
          </h1>
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base font-semibold text-teal-200/90 mt-1.5 tracking-wide">
          Quality Care At Your Home
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-teal-300/20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-teal-100 tracking-wider uppercase">
            Certified Nurses &amp; Paramedics 24/7
          </span>
        </div>
      </div>

      {/* Bottom Hero Image Section with Smooth Gradient Fade */}
      <div className="relative w-full h-[48vh] max-h-[420px] flex items-end justify-center overflow-hidden">
        <img
          src="/assets/ui/hero_doctor_seamless.jpg"
          alt="Caring Nurse at Home"
          className="w-full h-full object-cover object-top opacity-90 scale-105 transition-transform duration-1000 hover:scale-100"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800';
          }}
        />

        {/* Smooth Gradient Overlay Blending seamlessly into dark-teal background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#041f1b] via-[#041f1b]/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#073b34] to-transparent pointer-events-none" />

        {/* Bottom Tap Instruction */}
        <div className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center gap-2 text-center px-4">
          <div className="w-12 h-1 rounded-full bg-emerald-400/60 animate-pulse" />
          <span className="text-xs text-teal-200/80 font-medium tracking-wide">
            Tap anywhere to continue →
          </span>
        </div>
      </div>
    </div>
  );
};
