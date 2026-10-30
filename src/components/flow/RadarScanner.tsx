import React, { useEffect, useState, useRef } from 'react';
import { UserCheck } from 'lucide-react';
import { useCareX } from '../../context/CareXContext';

interface RadarScannerProps {
  onMatchFound?: () => void;
  autoProgress?: boolean;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({ onMatchFound, autoProgress = true }) => {
  const { providers, activeBooking } = useCareX();
  const [activeCandidate, setActiveCandidate] = useState(0);
  const [matchProgress, setMatchProgress] = useState(25);
  const hasTriggeredRef = useRef(false);
  const onMatchFoundRef = useRef(onMatchFound);

  useEffect(() => {
    onMatchFoundRef.current = onMatchFound;
  }, [onMatchFound]);

  const matchedProviderName = activeBooking?.providerName || (providers && providers[0]?.name) || 'Care Specialist';

  const candidates = [
    { name: providers[0]?.name || 'Specialist 1', role: 'RN Nurse', dist: '0.8 km', x: 28, y: 35 },
    { name: matchedProviderName, role: 'Care Specialist', dist: '1.4 km', x: 72, y: 38 },
    { name: providers[1]?.name || 'Specialist 2', role: 'Physio Tech', dist: '2.1 km', x: 50, y: 76 },
  ];

  useEffect(() => {
    const candidateTimer = setInterval(() => {
      setActiveCandidate((prev) => (prev + 1) % candidates.length);
    }, 1800);

    const progressTimer = setInterval(() => {
      setMatchProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 15);
      });
    }, 1200);

    return () => {
      clearInterval(candidateTimer);
      clearInterval(progressTimer);
    };
  }, []);

  useEffect(() => {
    if (matchProgress >= 100 && autoProgress && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const timer = setTimeout(() => {
        onMatchFoundRef.current?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [matchProgress, autoProgress]);

  return (
    <div className="relative w-full flex flex-col items-center py-3">
      {/* Radar Dish Container */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Radar concentric rings */}
        <div className="absolute inset-0 rounded-full border border-emerald-200/60 bg-radial from-emerald-100/30 via-emerald-50/20 to-transparent"></div>
        <div className="absolute inset-6 rounded-full border border-emerald-200/80"></div>
        <div className="absolute inset-12 rounded-full border border-emerald-300"></div>
        <div className="absolute inset-20 rounded-full border border-emerald-400/50"></div>

        {/* Crosshair lines */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-200/60"></div>
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-200/60"></div>

        {/* Sonar sweep needle */}
        <div
          className="absolute inset-0 rounded-full origin-center animate-spin pointer-events-none"
          style={{
            animationDuration: '3s',
            animationTimingFunction: 'linear',
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.35) 0deg, rgba(16, 185, 129, 0) 60deg, transparent 360deg)'
          }}
        ></div>

        {/* Center Target Indicator (Patient location) */}
        <div className="relative z-10 w-9 h-9 rounded-full bg-emerald-700 border-2 border-white shadow-md flex items-center justify-center text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping absolute"></div>
          <UserCheck className="w-4 h-4 text-white" />
        </div>

        {/* Candidate Specialist Nodes on the radar */}
        {candidates.map((cand, idx) => {
          const isSelected = idx === 1;
          const isActive = activeCandidate === idx;
          return (
            <div
              key={cand.name + idx}
              className={`absolute transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2 ${
                isActive ? 'scale-110 z-20' : 'scale-95 z-10 opacity-80'
              }`}
              style={{ left: `${cand.x}%`, top: `${cand.y}%` }}
            >
              <div className="relative group">
                {isActive && (
                  <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                )}
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                    isSelected
                      ? 'bg-emerald-600 border-white text-white ring-2 ring-emerald-400'
                      : 'bg-white border-emerald-500 text-emerald-800'
                  }`}
                >
                  {cand.name.charAt(0)}
                </div>

                {/* Candidate badge */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-[8px] font-medium px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs">
                  {cand.dist}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matching status pill */}
      <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        <span className="text-[11px] font-semibold text-emerald-800">
          {matchProgress < 50
            ? 'Scanning certified specialists near your location...'
            : matchProgress < 85
            ? 'Matching clinical skills: Injections, Phlebotomy & Physio...'
            : `Best match confirmed: ${matchedProviderName} (1.4 km)`}
        </span>
      </div>
    </div>
  );
};
