import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, Phone, MessageCircle, Star, ChevronRight, Check, Headphones, Award, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCareX } from '../../context/CareXContext';
import { HeaderBar } from './HeaderBar';
import {
  ServiceStartedHeroIllustration,
  InjectionsCategoryIcon,
  LabTestsCategoryIcon,
  PhysioCategoryIcon
} from './MedicalIllustrations';
import { INITIAL_SERVICE_PROGRESS } from '../../data/flowMockData';
import { ServiceProgressItem } from '../../types/flowTypes';

interface Screen5ServiceStartedProps {
  onCallSpecialist?: () => void;
  onChatSpecialist?: () => void;
  onViewDetails?: () => void;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
  onResetFlow?: () => void;
  onTabChange?: (tab: 'home' | 'book' | 'orders' | 'profile') => void;
  deliveryAddress?: string;
}

export const Screen5ServiceStarted: React.FC<Screen5ServiceStartedProps> = ({
  onCallSpecialist,
  onChatSpecialist,
  onViewDetails,
  onAddressClick,
  onCallSupportClick,
  onResetFlow,
  onTabChange,
  deliveryAddress
}) => {
  const { activeBooking, providers, completeBookingByPatient, updateBookingItemStatus, updateBookingStatus, showToast } = useCareX();
  const [progressItems, setProgressItems] = useState<ServiceProgressItem[]>(INITIAL_SERVICE_PROGRESS);
  const isCompleted = activeBooking?.status === 'completed' || (activeBooking?.isCompletedByPatient && activeBooking?.isCompletedByProvider);

  // Digital Vitals state
  const [bp, setBp] = useState(activeBooking?.vitalsRecorded?.bloodPressure || '120/80');
  const [pulse, setPulse] = useState(activeBooking?.vitalsRecorded?.pulseRate || '74');
  const [spo2, setSpo2] = useState(activeBooking?.vitalsRecorded?.spO2 || '98%');
  const [temp, setTemp] = useState(activeBooking?.vitalsRecorded?.temperature || '98.4 °F');
  const [careNotes, setCareNotes] = useState(activeBooking?.vitalsRecorded?.nurseNotes || 'Sterile clinical procedure administered successfully. Patient vitals stable and normal.');
  const [isVitalsRecorded, setIsVitalsRecorded] = useState(Boolean(activeBooking?.vitalsRecorded?.bloodPressure));

  // Dynamic provider details from DB
  const assignedDbProvider = providers.find(p => p.id === activeBooking?.providerId) || providers[0];
  const specialistName = activeBooking?.providerName || assignedDbProvider?.name || 'Care Specialist';
  const specialistRole = assignedDbProvider?.title || 'Registered Nurse';
  const specialistAvatar = assignedDbProvider?.avatar || '/assets/ui/hero_doctor.png';
  const specialistRating = assignedDbProvider?.rating || 4.9;
  const specialistExp = assignedDbProvider ? `${assignedDbProvider.experienceYears}+ Yrs Exp` : '8+ Yrs Exp';
  const specialistReviews = assignedDbProvider?.reviewCount || 128;

  // Sync checklist items from activeBooking.bookingItems if present
  useEffect(() => {
    if (activeBooking?.bookingItems && Array.isArray(activeBooking.bookingItems) && activeBooking.bookingItems.length > 0) {
      setProgressItems(activeBooking.bookingItems.map((bi: any) => ({
        id: bi.id,
        title: bi.title,
        timeEstimate: bi.duration || '15 mins',
        category: bi.category || 'injections',
        status: bi.status === 'Completed' ? 'completed' : bi.status === 'In Progress' ? 'in_progress' : 'pending',
      })));
    }
  }, [activeBooking?.bookingItems]);

  const renderServiceIcon = (category: string) => {
    switch (category) {
      case 'injections':
        return <InjectionsCategoryIcon size={26} />;
      case 'lab':
        return <LabTestsCategoryIcon size={26} />;
      case 'physio':
        return <PhysioCategoryIcon size={26} />;
      default:
        return <InjectionsCategoryIcon size={26} />;
    }
  };

  const trackerSteps = [
    { label: 'Confirmed', state: 'completed' },
    { label: 'Assigned', state: 'completed' },
    { label: 'On the way', state: 'completed' },
    { label: 'Arrived', state: 'completed' },
    { label: 'Service Started', state: 'current' },
  ];

  const handleToggleProgress = async (id: string) => {
    const item = progressItems.find(p => p.id === id);
    const nextStatus = item?.status === 'completed' ? 'pending' : item?.status === 'in_progress' ? 'completed' : 'in_progress';
    const dbStatus = nextStatus === 'completed' ? 'Completed' : nextStatus === 'in_progress' ? 'In Progress' : 'Pending';
    await updateBookingItemStatus(id, dbStatus, activeBooking?.id);
    setProgressItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: nextStatus } : i))
    );
  };

  const handleCompleteAll = async () => {
    setProgressItems((prev) =>
      prev.map((i) => ({ ...i, status: 'completed' as const }))
    );
    await completeBookingByPatient();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

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
        {/* Hero Card: Service Started */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857] text-white p-4 shadow-lg border border-emerald-800">
          <div className="relative z-10 pr-24">
            <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-400/40 text-[10px] font-bold text-emerald-100 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              <span>Service Started</span>
            </div>

            <h2 className="text-base font-extrabold tracking-tight">Care Underway</h2>

            <p className="text-[10.5px] text-emerald-100 font-medium leading-relaxed mt-1">
              Our care specialist has arrived and started the service.
            </p>

            <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-emerald-200 bg-emerald-900/40 px-2 py-0.5 rounded-md inline-flex border border-emerald-700/50">
              <Clock className="w-3 h-3" />
              <span>Session timer: 14 mins elapsed</span>
            </div>
          </div>

          {/* Seamless Clinical Procedure Widget */}
          <div className="absolute right-3 bottom-2.5 pointer-events-none flex items-center justify-end">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-t from-emerald-950/70 via-emerald-900/20 to-transparent backdrop-blur-xs flex items-center justify-center">
              <img 
                src="/assets/ui/service_started_care.png" 
                alt="Care Specialist Procedure" 
                className="w-full h-full object-contain p-1.5 select-none filter drop-shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/85 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-center gap-1 bg-black/45 backdrop-blur-md rounded-lg py-0.5 px-1 border border-white/15">
                <Stethoscope className="w-2.5 h-2.5 text-emerald-300" />
                <span className="text-[8.5px] font-extrabold text-white tracking-wide uppercase">Active Care</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Status Tracker */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3 left-4 right-4 h-0.5 bg-emerald-600 -z-0"></div>

            {trackerSteps.map((step) => (
              <div key={step.label} className="flex flex-col items-center z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step.state === 'current'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm animate-pulse'
                      : 'bg-emerald-600 text-white shadow-xs'
                  }`}
                >
                  {step.state === 'current' ? (
                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </div>
                <span className="text-[8.5px] mt-1 text-center font-bold text-emerald-800">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Care Specialist Card */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-900">Assigned Care Specialist</span>
            <button
              onClick={onViewDetails}
              className="text-[10px] font-bold text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View details</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={specialistAvatar}
                  alt={specialistName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {specialistName}
                </h4>
                <p className="text-[9.5px] text-slate-500 font-medium">{specialistRole}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[9.5px]">
                  <span className="flex items-center gap-0.5 font-bold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{specialistRating}</span>
                  </span>
                  <span className="text-slate-400">({specialistReviews})</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">Exp: {specialistExp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onCallSpecialist}
                className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex flex-col items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                title={`Call ${specialistName}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="text-[7.5px] font-bold mt-0.2">Call</span>
              </button>

              <button
                onClick={onChatSpecialist}
                className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex flex-col items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                title={`Chat with ${specialistName}`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[7.5px] font-bold mt-0.2">Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Service Progress Checklist Card */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-900">Service Progress</span>
            <span className="text-[9.5px] text-slate-400 font-medium">Tap to toggle status</span>
          </div>

          <div className="space-y-2">
            {progressItems.map((item) => {
              const isInProgress = item.status === 'in_progress';
              const isDone = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleProgress(item.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : isInProgress
                      ? 'bg-white border-emerald-300 shadow-2xs ring-1 ring-emerald-200/50'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                          : 'bg-white border border-slate-300 text-transparent'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      {isInProgress && <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-700" />}
                    </div>

                    <div className="shrink-0 drop-shadow-2xs">
                      {renderServiceIcon(item.category)}
                    </div>

                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900 leading-tight">
                        {item.title}
                      </h5>
                      <p className="text-[8.5px] text-slate-400 font-medium mt-0.5">
                        {item.timeEstimate}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span>In Progress</span>
                      </span>
                    )}
                    {isDone && (
                      <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        <span>Completed ✓</span>
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-[9px] font-semibold text-slate-400 px-2 py-0.5">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Post-Visit Digital Vitals Recording & Observation Form */}
          {!isCompleted && !activeBooking?.isCompletedByPatient && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Post-Visit Clinical Vitals &amp; Notes</span>
                </span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                  Clinical Record
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Blood Pressure (BP)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80 mmHg"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Pulse Rate</label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="74 bpm"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Oxygen (SpO2)</label>
                  <input
                    type="text"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="98%"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Temperature</label>
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="98.4 °F"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-0.5 text-[10px]">Care Notes &amp; Observations</label>
                <textarea
                  rows={2}
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  placeholder="Clinical observation notes..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-hidden leading-tight"
                />
              </div>
            </div>
          )}

          {isCompleted ? (
            <div className="mt-2.5 space-y-3">
              {/* Digital Visit Summary Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm text-left">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-tight">
                      Digital Visit Summary
                    </span>
                  </div>
                  <span className="text-[9.5px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                    Verified Record ✓
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white/80 rounded-xl p-2 border border-emerald-200/60 shadow-2xs">
                    <span className="text-[9px] text-slate-500 font-medium block">BP</span>
                    <span className="text-xs font-black text-slate-900 font-mono">{bp}</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2 border border-emerald-200/60 shadow-2xs">
                    <span className="text-[9px] text-slate-500 font-medium block">Pulse</span>
                    <span className="text-xs font-black text-slate-900 font-mono">{pulse}</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2 border border-emerald-200/60 shadow-2xs">
                    <span className="text-[9px] text-slate-500 font-medium block">SpO2</span>
                    <span className="text-xs font-black text-slate-900 font-mono">{spo2}</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2 border border-emerald-200/60 shadow-2xs">
                    <span className="text-[9px] text-slate-500 font-medium block">Temp</span>
                    <span className="text-xs font-black text-slate-900 font-mono">{temp}</span>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-2 border border-emerald-200/60 text-[10.5px] text-slate-700 leading-tight">
                  <span className="font-bold text-slate-900 block text-[10px] text-emerald-900 mb-0.5">Clinical Note:</span>
                  {careNotes}
                </div>

                <div className="flex items-center justify-between text-[10px] text-emerald-900 pt-1 font-semibold">
                  <span>Specialist: {specialistName} ({specialistRole})</span>
                  <span>Govt Council Reg Verified</span>
                </div>
              </div>

              <button
                onClick={onResetFlow}
                className="w-full py-2.5 bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Book Another Visit
              </button>
            </div>
          ) : activeBooking?.isCompletedByPatient ? (
            <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-amber-900 text-xs font-bold space-y-1">
              <p className="font-bold flex items-center justify-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 stroke-[3]" />
                Confirmed by Patient
              </p>
              <p className="text-[10px] text-amber-700 font-medium">Waiting for Care Specialist to finalize clinical closure.</p>
            </div>
          ) : (
            <button
              onClick={async () => {
                if (activeBooking?.id) {
                  await updateBookingStatus(activeBooking.id, 'completed', {
                    bloodPressure: bp.includes('/') ? bp : `${bp}/80`,
                    pulseRate: pulse.includes('bpm') ? pulse : `${pulse} bpm`,
                    spO2: spo2.includes('%') ? spo2 : `${spo2}%`,
                    temperature: temp.includes('°') ? temp : `${temp} °F`,
                    nurseNotes: careNotes,
                    recordedAt: new Date().toISOString()
                  });
                }
                await completeBookingByPatient();
                confetti({
                  particleCount: 110,
                  spread: 75,
                  origin: { y: 0.6 }
                });
              }}
              className="w-full mt-2.5 py-3 bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm &amp; Record Vitals (Complete Visit)</span>
            </button>
          )}
        </div>

        {/* Support Card: "We're here for you" */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h5 className="text-[11px] font-bold text-slate-900 leading-tight">
                We're here for you
              </h5>
              <p className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">
                For any help, contact our support team.
              </p>
            </div>
          </div>

          <button
            onClick={onCallSupportClick}
            className="flex items-center gap-1 bg-[#084d3e] hover:bg-[#063f33] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-2xs shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <Phone className="w-3 h-3" />
            <span>1-800-MAP2MEDIC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
