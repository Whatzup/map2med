import React, { useState } from 'react';

// ============================================================================
// 1. CATEGORY ICONS USING USER ATTACHMENTS FOR PHYSIO, INJECTIONS & WOUND CARE
// ============================================================================

export const InjectionsCategoryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-[#e6f4ea] overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {!imgError ? (
        <img
          src="/assets/aistudio/injection_8feb0c27.jpg"
          alt="Injections"
          className="w-full h-full object-cover rounded-xl pointer-events-none"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="injGradSvg" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <g transform="rotate(-45 24 24)">
            <rect x="22" y="6" width="4" height="12" rx="2" fill="#475569" />
            <rect x="20" y="16" width="8" height="18" rx="2" fill="#ffffff" stroke="#047857" strokeWidth="2" />
            <rect x="21.5" y="22" width="5" height="11" rx="1" fill="url(#injGradSvg)" />
            <line x1="24" y1="34" x2="24" y2="42" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      )}
    </div>
  );
};

export const WoundCareCategoryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-[#fff0e6] overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {!imgError ? (
        <img
          src="/assets/aistudio/wound_care_daebe630.jpeg"
          alt="Wound Care"
          className="w-full h-full object-cover rounded-xl pointer-events-none"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="rotate(45 24 24)">
            <rect x="12" y="20" width="24" height="8" rx="4" fill="#fdba74" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="20" y="20" width="8" height="8" fill="#ffffff" />
          </g>
          <g transform="rotate(-45 24 24)">
            <rect x="12" y="20" width="24" height="8" rx="4" fill="#fdba74" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="20" y="20" width="8" height="8" fill="#ffffff" />
          </g>
          <path d="M24 20 V28 M20 24 H28" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};

export const VitalsCategoryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-[#e8f2fe] overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {!imgError ? (
        <img
          src="/assets/ui/cat_vitals.png"
          alt="Vitals"
          className="w-full h-full object-contain rounded-xl pointer-events-none"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="10" width="24" height="28" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
          <path d="M16 20 H20 L22 14 L26 26 L28 18 L30 20 H32" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

export const LabTestsCategoryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-[#e6f7f5] overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {!imgError ? (
        <img
          src="/assets/ui/cat_lab_tests.png"
          alt="Lab Tests"
          className="w-full h-full object-contain rounded-xl pointer-events-none"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 10 V32 C16 36 19 38 22 38 C25 38 28 36 28 32 V10 Z" fill="#ffffff" stroke="#0891b2" strokeWidth="2" />
          <path d="M17 22 V32 C17 35 19 37 22 37 C25 37 27 35 27 32 V22 Z" fill="#e11d48" />
        </svg>
      )}
    </div>
  );
};

export const PhysioCategoryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-[#f0ebf9] overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {!imgError ? (
        <img
          src="/assets/aistudio/phsiotherapy_f85da909.jpeg"
          alt="Physio"
          className="w-full h-full object-cover rounded-xl pointer-events-none"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="14" r="5" fill="#7e22ce" />
          <path d="M20 19 V30 M12 24 L28 22 M14 38 L20 30 L26 38" stroke="#7e22ce" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="22" r="2.5" fill="#f59e0b" />
        </svg>
      )}
    </div>
  );
};

export const ElderCareCategoryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-[#fef7e6] overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {!imgError ? (
        <img
          src="/assets/ui/cat_elder_care.png"
          alt="Elder Care"
          className="w-full h-full object-contain rounded-xl pointer-events-none"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="16" r="5" fill="#d97706" />
          <path d="M16 26 C16 21 24 21 24 26 V36 H16 Z" fill="#d97706" />
          <circle cx="30" cy="30" r="6" stroke="#b45309" strokeWidth="2" fill="none" />
        </svg>
      )}
    </div>
  );
};


// ============================================================================
// 2. PROCEDURE ILLUSTRATIONS FOR COMPACT SERVICE CARDS
// ============================================================================

export const InjectionProcedureIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div style={{ height: size }} className={`w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-emerald-50/80 select-none ${className}`}>
      {!hasError ? (
        <img
          src="/assets/aistudio/injection_8feb0c27.jpg"
          alt="Injection Administration"
          className="w-full h-full object-cover rounded-md pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 p-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[9.5px] font-bold text-emerald-800 uppercase">Injection Visit</span>
        </div>
      )}
    </div>
  );
};

export const IVDripProcedureIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div style={{ height: size }} className={`w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-sky-50/80 select-none ${className}`}>
      {!hasError ? (
        <img
          src="/assets/ui/srv_iv_drip.png"
          alt="IV Drip Setup"
          className="w-full h-full object-contain pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 p-1">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
          <span className="text-[9.5px] font-bold text-sky-800 uppercase">IV Saline Drip</span>
        </div>
      )}
    </div>
  );
};

export const VaccineProcedureIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div style={{ height: size }} className={`w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-amber-50/80 select-none ${className}`}>
      {!hasError ? (
        <img
          src="/assets/ui/srv_vaccination.png"
          alt="Vaccination"
          className="w-full h-full object-contain pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 p-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span className="text-[9.5px] font-bold text-amber-800 uppercase">Vaccine Dose</span>
        </div>
      )}
    </div>
  );
};

export const IMIProcedureIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div style={{ height: size }} className={`w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-[#e6f4ea] select-none ${className}`}>
      {!hasError ? (
        <img
          src="/assets/aistudio/injection_8feb0c27.jpg"
          alt="IM / IV Injection"
          className="w-full h-full object-cover rounded-md pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 p-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          <span className="text-[9.5px] font-bold text-purple-800 uppercase">IM / IV Dose</span>
        </div>
      )}
    </div>
  );
};

export const BloodSampleIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div style={{ height: size }} className={`w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-rose-50/80 select-none ${className}`}>
      {!hasError ? (
        <img
          src="/assets/ui/cart_item_lab.png"
          alt="Blood Test"
          className="w-full h-full object-contain pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 p-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="text-[9.5px] font-bold text-rose-800 uppercase">Blood Sample</span>
        </div>
      )}
    </div>
  );
};

export const PhysioIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div style={{ height: size }} className={`w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-purple-50/80 select-none ${className}`}>
      {!hasError ? (
        <img
          src="/assets/aistudio/phsiotherapy_f85da909.jpeg"
          alt="Physio Session"
          className="w-full h-full object-cover rounded-md pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 p-1">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
          <span className="text-[9.5px] font-bold text-teal-800 uppercase">Physio Therapy</span>
        </div>
      )}
    </div>
  );
};

export const WoundCareProcedureIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <div style={{ height: size }} className={`w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-orange-50/80 select-none ${className}`}>
      {!hasError ? (
        <img
          src="/assets/aistudio/wound_care_daebe630.jpeg"
          alt="Wound Care"
          className="w-full h-full object-cover rounded-md pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5 p-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          <span className="text-[9.5px] font-bold text-orange-800 uppercase">Wound Care</span>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 3. BACKGROUND DECORATOR WRAPPERS
// ============================================================================

export const BackgroundInjectionAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);

export const BackgroundIVDripAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);

export const BackgroundVaccineAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);

export const BackgroundWoundCareAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);

export const BackgroundVitalsAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);

export const BackgroundLabTestAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);

export const BackgroundPhysioAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);

export const BackgroundElderCareAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl select-none opacity-10">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent z-10"></div>
  </div>
);


// ============================================================================
// 4. HERO CARD 3D MEDICAL SPECIALISTS
// ============================================================================

export const NurseDoctorIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 120, className = '' }) => (
  <div style={{ width: size, height: size * 1.05 }} className={`relative flex items-end justify-center select-none ${className}`}>
    <img
      src="/assets/ui/hero_doctor.png"
      alt="Care Specialist Doctor"
      className="w-full h-full object-contain object-bottom drop-shadow-xl pointer-events-none"
    />
  </div>
);

export const ScooterSpecialistIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 150, className = '' }) => (
  <div style={{ width: size, height: size * 0.82 }} className={`relative flex items-end justify-center select-none ${className}`}>
    <img
      src="/assets/ui/scooter_on_the_way.png"
      alt="Scooter Specialist On The Way"
      className="w-full h-full object-contain object-bottom drop-shadow-xl pointer-events-none"
    />
  </div>
);

export const ServiceStartedHeroIllustration: React.FC<{ size?: number; className?: string }> = ({ size = 130, className = '' }) => (
  <div style={{ width: size, height: size * 0.9 }} className={`relative flex items-end justify-center select-none ${className}`}>
    <img
      src="/assets/ui/service_started_care.png"
      alt="Service Started Bedside Care"
      className="w-full h-full object-contain object-bottom drop-shadow-xl rounded-xl pointer-events-none"
    />
  </div>
);
