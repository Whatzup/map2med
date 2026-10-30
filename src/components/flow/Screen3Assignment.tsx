import React from 'react';
import { UserCheck, ShieldCheck, MapPin, Clock, Bell, Check, ArrowRight, Star } from 'lucide-react';
import { HeaderBar } from './HeaderBar';
import { NurseDoctorIllustration } from './MedicalIllustrations';
import { RadarScanner } from './RadarScanner';
import { MATCHING_CRITERIA } from '../../data/flowMockData';
import { useCareX } from '../../context/CareXContext';

interface Screen3AssignmentProps {
  bookingId?: string;
  onSpecialistAssigned?: () => void;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
  onTabChange?: (tab: 'home' | 'book' | 'orders' | 'profile') => void;
  deliveryAddress?: string;
}

export const Screen3Assignment: React.FC<Screen3AssignmentProps> = ({
  bookingId = '',
  onSpecialistAssigned,
  onAddressClick,
  onCallSupportClick,
  onTabChange,
  deliveryAddress
}) => {
  const { activeBooking, providers } = useCareX();

  const assignedProv = providers.find(p => p.id === activeBooking?.providerId) || 
    providers.find(p => p.isAvailable) || 
    providers[0];

  const assignedName = activeBooking?.providerName || assignedProv?.name || 'Priya Nair';
  const assignedRole = assignedProv?.title || 'Senior Registered Nurse (RN)';
  const assignedAvatar = assignedProv?.avatar || '/assets/ui/hero_doctor_seamless.jpg';
  const isAwaitingApproval = activeBooking?.status === 'awaiting_provider_approval';

  const steps = [
    { label: 'Confirmed', state: 'completed' },
    { label: isAwaitingApproval ? 'Approval' : 'Assigned', state: 'current' },
    { label: 'On the way', state: 'upcoming' },
    { label: 'Arriving', state: 'upcoming' },
    { label: 'Service Started', state: 'upcoming' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] text-slate-800 text-left">
      {/* Top Header */}
      <HeaderBar 
        currentAddress={deliveryAddress} 
        onAddressClick={onAddressClick} 
        onCallSupportClick={onCallSupportClick} 
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 scrollbar-thin pb-36">
        {/* Booking Confirmed Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857] text-white p-4 shadow-lg border border-emerald-800">
          <div className="relative z-10 pr-24">
            {/* White Checkmark Icon */}
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2 border border-white/40">
              <Check className="w-5 h-5 text-emerald-200 stroke-[3]" />
            </div>

            <h2 className="text-base font-extrabold tracking-tight">Booking Confirmed!</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] font-mono text-emerald-200">ID #{bookingId}</span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/30 text-emerald-100 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-400/40">
                <Check className="w-2.5 h-2.5 stroke-[3] text-emerald-200" />
                <span>Payment Received</span>
              </span>
            </div>

            <p className="text-[10px] text-emerald-100 font-medium leading-relaxed mt-1.5 opacity-90">
              {isAwaitingApproval
                ? `Booking dispatched to ${assignedName} (${assignedRole}). Paramedic approval and transit handshake in progress.`
                : `Matched with certified specialist ${assignedName}. Transit protocol standing by.`}
            </p>
          </div>
          {/* Seamless Care Specialist Doctor Character */}
          <div className="absolute right-3 bottom-2.5 pointer-events-none flex items-center justify-end">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent backdrop-blur-xs">
              <img 
                src={assignedAvatar} 
                alt={assignedName} 
                className="w-full h-full object-cover object-top select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/85 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-center gap-1 bg-black/45 backdrop-blur-md rounded-lg py-0.5 px-1 border border-white/15">
                <Check className="w-2.5 h-2.5 stroke-[3] text-emerald-300" />
                <span className="text-[8.5px] font-extrabold text-white tracking-wide uppercase truncate">
                  {assignedName.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Track Specialist CTA */}
        <button
          onClick={onSpecialistAssigned}
          className="w-full bg-[#084d3e] hover:bg-[#064034] active:scale-[0.99] text-white py-3 px-4 rounded-xl font-bold text-xs shadow-md border border-emerald-900 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <span>{isAwaitingApproval ? 'View Paramedic Approval & Tracking' : 'Track Specialist & Dispatch Status'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* "What's Next?" 5-Step Process Tracker */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
          <h3 className="text-[11px] font-bold text-slate-900 mb-2.5">What's Next?</h3>

          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 -z-0"></div>
            <div className="absolute top-3 left-4 w-1/4 h-0.5 bg-emerald-600 -z-0"></div>

            {steps.map((step, idx) => (
              <div key={step.label} className="flex flex-col items-center z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step.state === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : step.state === 'current'
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600 ring-2 ring-emerald-400/30 animate-pulse'
                      : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                >
                  {step.state === 'completed' ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[8.5px] mt-1 text-center font-medium ${
                    step.state === 'current'
                      ? 'font-bold text-emerald-800'
                      : step.state === 'completed'
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Scanner Card */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
          <h4 className="text-xs font-bold text-slate-900">Finding the right care specialists...</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">This may take a few moments</p>

          {/* Interactive Radar Component with auto-progress enabled */}
          <RadarScanner onMatchFound={onSpecialistAssigned} autoProgress={true} />

          {/* Manual Trigger to proceed right away */}
          <button
            onClick={onSpecialistAssigned}
            className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <span>Care Specialist Found! View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Matching Criteria Grid (2x2) */}
        <div className="grid grid-cols-2 gap-2">
          {MATCHING_CRITERIA.map((crit) => {
            return (
              <div
                key={crit.id}
                className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-start gap-2 text-left"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  {crit.id === 'skills' && <UserCheck className="w-3.5 h-3.5" />}
                  {crit.id === 'service' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {crit.id === 'distance' && <MapPin className="w-3.5 h-3.5" />}
                  {crit.id === 'availability' && <Clock className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-900 leading-tight">
                    {crit.title}
                  </h5>
                  <p className="text-[8.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    {crit.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notification Alert Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <p className="text-[10px] text-emerald-950 font-medium">
            You will be notified once care specialist is assigned.
          </p>
        </div>
      </div>
    </div>
  );
};
