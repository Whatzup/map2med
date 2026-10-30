import React, { useEffect, useState } from 'react';
import { Home, Compass, Navigation } from 'lucide-react';

interface LiveLocationMapProps {
  isMoving?: boolean;
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({ isMoving = true }) => {
  const [progress, setProgress] = useState(0.55);

  useEffect(() => {
    if (!isMoving) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) return 0.2;
        return prev + 0.008;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isMoving]);

  // Points along the SVG route:
  // Path starts at (40, 75) -> (85, 80) -> (140, 60) -> (195, 45) -> (260, 40)
  // Let's compute scooter x, y along smooth spline
  const getPositionOnPath = (t: number) => {
    // 3 segments
    if (t < 0.35) {
      const u = t / 0.35;
      return {
        x: 40 + (95 - 40) * u,
        y: 78 - 8 * Math.sin(u * Math.PI),
        angle: 5
      };
    } else if (t < 0.75) {
      const u = (t - 0.35) / 0.4;
      return {
        x: 95 + (185 - 95) * u,
        y: 78 - (78 - 50) * u,
        angle: -18
      };
    } else {
      const u = (t - 0.75) / 0.25;
      return {
        x: 185 + (265 - 185) * u,
        y: 50 - (50 - 36) * u,
        angle: -10
      };
    }
  };

  const pos = getPositionOnPath(progress);

  return (
    <div className="relative w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner select-none">
      {/* City Road Grid Texture */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#f1f5f9" />
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#roadGrid)" />

        {/* Gray secondary roads */}
        <path d="M -10 30 Q 80 40 180 20 T 360 30" stroke="#cbd5e1" strokeWidth="6" fill="none" />
        <path d="M 60 -10 Q 70 60 80 140" stroke="#cbd5e1" strokeWidth="5" fill="none" />
        <path d="M 210 -10 Q 220 70 230 140" stroke="#cbd5e1" strokeWidth="5" fill="none" />
        <path d="M -10 110 Q 120 90 280 120" stroke="#cbd5e1" strokeWidth="6" fill="none" />

        {/* Green park zones */}
        <rect x="15" y="10" width="35" height="40" rx="6" fill="#dcfce7" opacity="0.7" />
        <rect x="235" y="65" width="55" height="35" rx="6" fill="#dcfce7" opacity="0.7" />

        {/* Active Route line shadow */}
        <path
          d="M 35 78 Q 70 82 95 78 T 185 50 T 270 36"
          stroke="#065f46"
          strokeWidth="6"
          strokeLinecap="round"
          strokeOpacity="0.15"
          fill="none"
        />

        {/* Active Route line */}
        <path
          d="M 35 78 Q 70 82 95 78 T 185 50 T 270 36"
          stroke="url(#routeGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 4"
          fill="none"
        />
      </svg>

      {/* Start location subtle dot */}
      <div className="absolute left-[30px] top-[72px] w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-sm flex items-center justify-center">
        <div className="w-1 h-1 bg-white rounded-full"></div>
      </div>

      {/* Moving Scooter Marker */}
      <div
        className="absolute z-20 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        <div className="relative">
          {/* Animated pulse ring around scooter */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-30 animate-ping"></span>
          
          <div className="relative w-8 h-8 rounded-full bg-emerald-700 border-2 border-white shadow-md flex items-center justify-center text-white">
            <Navigation className="w-4 h-4 fill-white text-white transform rotate-45" />
          </div>
          {/* Speed tag tooltip */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-950 text-white text-[9px] font-semibold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
            28 km/h
          </div>
        </div>
      </div>

      {/* Destination Pin (Home) */}
      <div className="absolute right-[22px] top-[18px] z-10 flex flex-col items-center">
        <div className="relative">
          <span className="absolute -inset-1 rounded-full bg-teal-600 opacity-25 animate-pulse"></span>
          <div className="w-7 h-7 rounded-full bg-[#084d3e] border-2 border-white shadow-md flex items-center justify-center text-white">
            <Home className="w-3.5 h-3.5" />
          </div>
        </div>
        <span className="text-[9px] font-bold text-emerald-900 bg-white/90 px-1 rounded shadow-xs mt-0.5 border border-emerald-100">
          Home
        </span>
      </div>

      {/* Mini Compass overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/85 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium border border-slate-200 shadow-xs">
        <Compass className="w-3 h-3 text-emerald-700 animate-spin" style={{ animationDuration: '12s' }} />
        <span>Live Route • Sector 54 Road</span>
      </div>
    </div>
  );
};
