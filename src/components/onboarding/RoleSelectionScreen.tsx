import React from 'react';
import { ChevronLeft, ChevronRight, HeartPulse, Stethoscope } from 'lucide-react';
import { UserRole } from '../../types/carex';

interface RoleSelectionScreenProps {
  onBackToAuth: () => void;
  onRoleSelected: (role: UserRole) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ 
  onBackToAuth, 
  onRoleSelected 
}) => {
  interface RoleOption {
    id: UserRole;
    title: string;
    subtext: string;
    icon: React.ElementType;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    tagLabel: string;
  }

  // Strictly ONLY 2 Roles: Patient & Nurse
  const roleOptions: RoleOption[] = [
    {
      id: 'patient',
      title: 'I am a Patient',
      subtext: 'Book nurse & paramedic services at doorstep in 15-30 mins',
      icon: HeartPulse,
      badgeBg: 'bg-teal-500/20',
      badgeBorder: 'border-teal-400/40',
      badgeText: 'text-teal-300',
      tagLabel: 'Doorstep Care'
    },
    {
      id: 'provider', // Nurse / Clinical Practitioner
      title: 'I am a Nurse',
      subtext: 'Provide nursing, vitals & clinical home visits',
      icon: Stethoscope,
      badgeBg: 'bg-emerald-500/20',
      badgeBorder: 'border-emerald-400/40',
      badgeText: 'text-emerald-300',
      tagLabel: 'Clinical Specialist'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#073b34] via-[#052e28] to-[#041f1b] text-white flex flex-col justify-between p-5 sm:p-7 relative overflow-y-auto scrollbar-thin select-none animate-in fade-in duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-between relative z-10 py-4">
        {/* Top Clean Header with Back Button (NO step counter) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBackToAuth}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-teal-300/20 text-white transition-all cursor-pointer active:scale-95"
              title="Back to login"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="text-center space-y-1.5 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
              Select Your Role
            </h1>
            <p className="text-xs sm:text-sm font-medium text-teal-200/80">
              Choose how you want to continue with Map2Medic
            </p>
          </div>

          {/* Role Cards List (STRICTLY PATIENT & NURSE ONLY) */}
          <div className="space-y-4">
            {roleOptions.map((roleOpt) => {
              const Icon = roleOpt.icon;

              return (
                <button
                  key={roleOpt.id}
                  type="button"
                  onClick={() => onRoleSelected(roleOpt.id)}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-teal-400/25 backdrop-blur-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] shadow-lg hover:shadow-emerald-500/10 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {/* Role Icon Badge */}
                    <div className={`w-12 h-12 rounded-2xl ${roleOpt.badgeBg} border ${roleOpt.badgeBorder} ${roleOpt.badgeText} flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-white tracking-tight">
                          {roleOpt.title}
                        </h2>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-teal-200 border border-teal-300/20">
                          {roleOpt.tagLabel}
                        </span>
                      </div>
                      <p className="text-xs text-teal-200/80 font-medium mt-0.5 line-clamp-2 leading-snug">
                        {roleOpt.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-emerald-500 group-hover:text-slate-950 text-teal-200 flex items-center justify-center shrink-0 transition-all">
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 text-center">
          <p className="text-[11px] text-teal-200/60 font-medium">
            Selecting a role opens the dedicated registration form for that account type.
          </p>
        </div>
      </div>
    </div>
  );
};
