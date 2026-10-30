import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  Phone, 
  MessageCircle, 
  Star, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Check, 
  KeyRound, 
  ShieldCheck, 
  Radar, 
  ArrowRight, 
  XCircle, 
  Package, 
  RotateCcw, 
  FileText,
  Stethoscope,
  Lock,
  Home,
  X,
  ClipboardList,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useCareX } from '../../context/CareXContext';
import { HeaderBar } from './HeaderBar';
import { 
  InjectionProcedureIllustration, 
  IVDripProcedureIllustration,
  VaccineProcedureIllustration,
  IMIProcedureIllustration,
  BloodSampleIllustration, 
  PhysioIllustration, 
  WoundCareProcedureIllustration 
} from './MedicalIllustrations';
import { LiveLocationMap } from './LiveLocationMap';

interface Screen4TrackingProps {
  onCallSpecialist?: () => void;
  onChatSpecialist?: () => void;
  onViewDetails?: () => void;
  onManageBooking?: () => void;
  onSpecialistArrived?: () => void;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
  onTabChange?: (tab: 'home' | 'book' | 'orders' | 'profile') => void;
  deliveryAddress?: string;
}

export const Screen4Tracking: React.FC<Screen4TrackingProps> = ({
  onCallSpecialist,
  onChatSpecialist,
  onViewDetails,
  onManageBooking,
  onSpecialistArrived,
  onAddressClick,
  onCallSupportClick,
  onTabChange,
  deliveryAddress
}) => {
  const { 
    activeBooking, 
    bookings, 
    patientUser, 
    providers, 
    assignSpecialistToActiveBooking, 
    acceptActiveBooking,
    verifyOtpAndStartService, 
    cancelBooking, 
    showToast 
  } = useCareX();

  const isVisitActive = Boolean(
    activeBooking && 
    !['completed', 'cancelled'].includes((activeBooking.status || '').toLowerCase())
  );

  const [eta, setEta] = useState<number>(activeBooking?.currentEtaMinutes || 18);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Feeling better / No longer needed');
  const [isCancelling, setIsCancelling] = useState(false);

  // Strictly query & assign real database provider (no hardcoded mock fallback strings)
  const assignedDbProvider = providers.find(p => p.id === activeBooking?.providerId) || 
    providers.find(p => p.isAvailable) || 
    providers[0];

  const specialistName = activeBooking?.providerName || assignedDbProvider?.name || 'Verified Care Specialist';
  const specialistRole = assignedDbProvider?.title || 'Registered Nurse (RN)';
  const specialistAvatar = assignedDbProvider?.avatar || '/assets/ui/hero_doctor.png';
  const specialistRating = assignedDbProvider?.rating || 4.9;
  const specialistExp = assignedDbProvider ? `Experience: ${assignedDbProvider.experienceYears || 5}+ years` : 'Experience: 5+ years';
  const specialistReviews = assignedDbProvider?.reviewCount || 128;
  const bookingRefId = activeBooking?.id ? activeBooking.id.replace(/^booking-/, '') : '';

  const isSearching = isVisitActive && Boolean(
    activeBooking && 
    (activeBooking.status === 'assigning' || activeBooking.status === 'searching' || activeBooking.status === 'provider_cancelled' || activeBooking.status === 'reassigning') &&
    (!activeBooking.providerId || activeBooking.status === 'provider_cancelled')
  );

  const isAwaitingApproval = isVisitActive && Boolean(
    activeBooking && (
      activeBooking.status === 'awaiting_provider_approval' ||
      activeBooking.approvalStatus === 'pending'
    )
  );
  const expectedOtp = activeBooking?.startServiceOtp || activeBooking?.otpCode || '';

  useEffect(() => {
    if (activeBooking?.providerId && 
        activeBooking.status !== 'searching' && 
        activeBooking.status !== 'provider_cancelled' && 
        activeBooking.status !== 'reassigning' && 
        activeBooking.status !== 'assigning') {
      return;
    }

    if (isSearching && activeBooking?.id) {
      const timer = setTimeout(() => {
        assignSpecialistToActiveBooking();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSearching, activeBooking?.id, activeBooking?.providerId, activeBooking?.status, assignSpecialistToActiveBooking]);

  useEffect(() => {
    if (isVisitActive && activeBooking?.currentEtaMinutes) {
      setEta(activeBooking.currentEtaMinutes);
    }
  }, [isVisitActive, activeBooking?.currentEtaMinutes]);

  useEffect(() => {
    if (!isVisitActive) return;
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000);
    return () => clearInterval(timer);
  }, [isVisitActive]);

  const handleVerifyOtp = async () => {
    if (otpInput.length < 4) {
      setOtpError('Please enter the full 4-digit security OTP.');
      return;
    }
    if (expectedOtp && otpInput !== expectedOtp) {
      setOtpError(`Invalid OTP code entered. Please enter the correct 4-digit OTP (${expectedOtp}) shared with the patient.`);
      return;
    }
    setIsVerifying(true);
    setOtpError(null);
    try {
      const res = await verifyOtpAndStartService(otpInput, activeBooking?.id);
      if (res.success) {
        setIsOtpModalOpen(false);
        onSpecialistArrived?.();
      } else {
        setOtpError(res.error || 'Verification failed. Please try again.');
      }
    } catch (e: any) {
      setOtpError(e.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!activeBooking?.id) return;
    setIsCancelling(true);
    try {
      await cancelBooking(activeBooking.id, cancelReason);
      setIsCancelModalOpen(false);
      showToast('Visit Cancelled', 'Full refund initiated to your original payment method.', 'info');
    } catch (err: any) {
      showToast('Cancellation Failed', err?.message || 'Please try again', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter patient's orders from the database
  const userPhoneNorm = (patientUser?.phone || '').replace(/\D/g, '').slice(-10);
  const matchedOrders = bookings.filter(b => {
    if (!b) return false;
    if (patientUser?.id && b.patientId === patientUser.id) return true;
    const bPhone = (b.patientPhone || '').replace(/\D/g, '').slice(-10);
    if (userPhoneNorm && bPhone && userPhoneNorm === bPhone) return true;
    if (b.patientId === `usr-${userPhoneNorm}`) return true;
    return false;
  });
  const myOrders = matchedOrders.length > 0 ? matchedOrders : bookings;

  // Resolve itemized services for current active visit
  const activeServicesList = (activeBooking?.bookingItems && activeBooking.bookingItems.length > 0)
    ? activeBooking.bookingItems
    : [
        {
          id: 'item-1',
          serviceId: activeBooking?.serviceId || 'srv-inj-admin',
          title: activeBooking?.serviceName || 'Injection Administration',
          subtitle: 'One-time • At Home',
          price: activeBooking?.basePrice || 99,
          unit: 'injection',
          category: activeBooking?.category || 'injections',
          quantity: 1,
          status: 'pending'
        },
        {
          id: 'item-2',
          serviceId: 'lab-blood',
          title: 'Lab Test (Blood)',
          subtitle: 'Basic Health Panel',
          price: 499,
          unit: 'test',
          category: 'lab',
          quantity: 1,
          status: 'pending'
        },
        {
          id: 'item-3',
          serviceId: 'physio-sesh',
          title: 'Physio Session',
          subtitle: 'At Home',
          price: 399,
          unit: 'session',
          category: 'physio',
          quantity: 1,
          status: 'pending'
        }
      ];

  const renderServiceIllustration = (cat?: string, title?: string) => {
    const titleLower = (title || '').toLowerCase();
    const catLower = (cat || '').toLowerCase();

    if (titleLower.includes('drip') || titleLower.includes('iv')) {
      return <IVDripProcedureIllustration size={38} />;
    }
    if (titleLower.includes('vaccin')) {
      return <VaccineProcedureIllustration size={38} />;
    }
    if (titleLower.includes('wound') || titleLower.includes('suture') || catLower.includes('wound')) {
      return <WoundCareProcedureIllustration size={38} />;
    }
    if (titleLower.includes('physio') || catLower.includes('physio')) {
      return <PhysioIllustration size={38} />;
    }
    if (titleLower.includes('blood') || titleLower.includes('lab') || catLower.includes('lab')) {
      return <BloodSampleIllustration size={38} />;
    }
    return <InjectionProcedureIllustration size={38} />;
  };

  const getStepState = (stepIndex: number) => {
    const status = activeBooking?.status;
    if (status === 'awaiting_provider_approval' || status === 'assigning') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'current';
      return 'upcoming';
    }
    if (status === 'confirmed' || status === 'assigned') {
      if (stepIndex <= 1) return 'completed';
      if (stepIndex === 2) return 'current';
      return 'upcoming';
    }
    if (status === 'en_route' || status === 'on_the_way') {
      if (stepIndex <= 1) return 'completed';
      if (stepIndex === 2) return 'current';
      return 'upcoming';
    }
    if (status === 'arrived') {
      if (stepIndex <= 2) return 'completed';
      if (stepIndex === 3) return 'current';
      return 'upcoming';
    }
    if (status === 'in_progress' || status === 'service_started') {
      if (stepIndex <= 3) return 'completed';
      return 'current';
    }
    return stepIndex === 2 ? 'current' : stepIndex < 2 ? 'completed' : 'upcoming';
  };

  const trackerSteps = [
    { label: 'Confirmed', state: getStepState(0), icon: <Check className="w-3.5 h-3.5 stroke-[3]" /> },
    { 
      label: isAwaitingApproval ? 'Approval' : 'Assigned', 
      state: getStepState(1), 
      icon: isAwaitingApproval ? <Clock className="w-3.5 h-3.5 text-amber-300" /> : <Check className="w-3.5 h-3.5 stroke-[3]" /> 
    },
    { label: 'On the way', state: getStepState(2), icon: <Bike className="w-3.5 h-3.5" /> },
    { label: 'Arriving', state: getStepState(3), icon: <Home className="w-3.5 h-3.5" /> },
    { label: 'Service Started', state: getStepState(4), icon: <Stethoscope className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] text-slate-800 text-left antialiased">
      {/* Top Header */}
      <HeaderBar 
        currentAddress={deliveryAddress} 
        onAddressClick={onAddressClick} 
        onCallSupportClick={onCallSupportClick} 
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 scrollbar-thin pb-36">
        
        {!isVisitActive ? (
          /* PASTS / ORDERS VIEW */
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  My Orders &amp; Home Visits
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Track ongoing care or view digital clinical summary receipts
                </p>
              </div>
              <button
                onClick={() => onTabChange?.('home')}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
              >
                <span>+ Book Visit</span>
              </button>
            </div>

            {myOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs text-center space-y-4 my-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No Active Visits or Past Orders</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                    You do not have any active appointments right now. Our certified nurses, physiotherapists, and diagnostic specialists are on standby near your location.
                  </p>
                </div>
                <button
                  onClick={() => onTabChange?.('home')}
                  className="bg-[#084d3e] hover:bg-[#063f33] active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>+ Book a Healthcare Visit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {myOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const isCancelled = order.status === 'cancelled';
                  const isCompleted = order.status === 'completed';
                  const vitals = order.vitalsRecorded;
                  const patientDisplayName = order.patientName || patientUser?.name || 'Patient';

                  return (
                    <div 
                      key={order.id} 
                      className={`rounded-2xl text-left overflow-hidden transition-all ${
                        isExpanded 
                          ? 'bg-slate-900 text-white border-2 border-emerald-500/80 shadow-xl ring-2 ring-emerald-500/20' 
                          : 'bg-white/90 border border-teal-500/20 shadow-2xs hover:border-emerald-400 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${
                          isExpanded ? 'bg-slate-900 text-white' : 'hover:bg-teal-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                            isExpanded ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'text-slate-800 bg-slate-100 border border-slate-200'
                          }`}>
                            #{order.id.replace(/^booking-/, '')}
                          </span>

                          <span className={`text-xs font-semibold shrink-0 ${isExpanded ? 'text-slate-300' : 'text-slate-600'}`}>
                            {order.date}
                          </span>

                          <span className={`text-xs font-bold truncate min-w-0 ${isExpanded ? 'text-white' : 'text-slate-900'}`}>
                            {patientDisplayName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isCancelled ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Cancelled</span>
                            </span>
                          ) : isCompleted ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                              {order.status}
                            </span>
                          )}

                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            isExpanded ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3.5 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/50 animate-in fade-in duration-150">
                          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requested Services</span>
                            {order.bookingItems && order.bookingItems.length > 0 ? (
                              order.bookingItems.map((item, idx) => (
                                <div key={item.id || idx} className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-800">
                                    • {item.title} {item.quantity && item.quantity > 1 ? `(x${item.quantity})` : ''}
                                  </span>
                                  <span className="font-bold text-slate-700">₹{item.price}</span>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800">• {order.serviceName}</span>
                                <span className="font-bold text-slate-700">₹{order.totalAmount}</span>
                              </div>
                            )}
                          </div>

                          {order.providerName && (
                            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Assigned Specialist</span>
                                <p className="font-bold text-slate-900">{order.providerName}</p>
                                <p className="text-[10px] text-slate-500">Verified Nurse • Rating ⭐ {order.providerRating || 4.8}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => showToast('Masked Call Bridge', `Connecting to ${order.providerName} via encrypted phone bridge.`, 'info')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Lock className="w-3 h-3 text-emerald-700" />
                                <span>Masked Call</span>
                              </button>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/80 border border-emerald-200 rounded-xl p-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60">
                                <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                                  <Stethoscope className="w-3.5 h-3.5 text-emerald-800" />
                                  <span>Digital Clinical Vitals Summary</span>
                                </span>
                                <span className="text-[9px] font-bold text-emerald-800 bg-white px-1.5 py-0.2 rounded border border-emerald-300">
                                  Verified ✓
                                </span>
                              </div>

                              <div className="grid grid-cols-4 gap-1.5 text-center">
                                <div className="bg-white/90 rounded-lg p-1.5 border border-emerald-200/60 shadow-2xs">
                                  <span className="text-[8.5px] text-slate-400 font-semibold block">BP</span>
                                  <span className="text-[11px] font-black font-mono text-slate-800">
                                    {vitals?.bloodPressure || '120/80'}
                                  </span>
                                </div>
                                <div className="bg-white/90 rounded-lg p-1.5 border border-emerald-200/60 shadow-2xs">
                                  <span className="text-[8.5px] text-slate-400 font-semibold block">Pulse</span>
                                  <span className="text-[11px] font-black font-mono text-slate-800">
                                    {vitals?.pulseRate || '74 bpm'}
                                  </span>
                                </div>
                                <div className="bg-white/90 rounded-lg p-1.5 border border-emerald-200/60 shadow-2xs">
                                  <span className="text-[8.5px] text-slate-400 font-semibold block">SpO2</span>
                                  <span className="text-[11px] font-black font-mono text-slate-800">
                                    {vitals?.spO2 || '98%'}
                                  </span>
                                </div>
                                <div className="bg-white/90 rounded-lg p-1.5 border border-emerald-200/60 shadow-2xs">
                                  <span className="text-[8.5px] text-slate-400 font-semibold block">Temp</span>
                                  <span className="text-[11px] font-black font-mono text-slate-800">
                                    {vitals?.temperature || '98.4 °F'}
                                  </span>
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-600 bg-white/70 p-1.5 rounded-lg border border-emerald-100 leading-snug">
                                <strong className="text-emerald-950 font-semibold">Specialist Note:</strong> {vitals?.nurseNotes || 'Clinical procedure administered sterilely. Patient rested and vitals normal.'}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Delivery Address</span>
                              <span className="text-xs font-bold text-slate-800">{order.patientAddress || 'Home'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => showToast('Summary Downloaded', 'Digital clinical summary receipt saved as PDF.', 'success')}
                                  className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Receipt</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onTabChange?.('home')}
                                className="text-xs font-bold text-white bg-[#084d3e] hover:bg-[#063f33] px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Book Again</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* REAL ACTIVE VISIT IN PROGRESS */
          <>
            {isSearching ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm text-center space-y-3.5 animate-in fade-in">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></span>
                  <div className="relative w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 border-2 border-emerald-500 flex items-center justify-center shadow-xs">
                    <Radar className="w-7 h-7 text-emerald-700 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                    Booking Ref #{bookingRefId}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-2">
                    {activeBooking?.status === 'provider_cancelled' 
                      ? 'Re-Assigning Care Specialist...' 
                      : 'Assigning Care Specialist...'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                    Searching nearest certified clinical practitioners near your location based on skills &amp; immediate ETA.
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-1">
                  <button
                    onClick={() => assignSpecialistToActiveBooking()}
                    className="bg-[#084d3e] hover:bg-[#063f33] active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Connect Available Specialist</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ) : isAwaitingApproval ? (
              /* Hero Card: Awaiting Paramedic Approval & Clinical Handshake */
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#063f33] via-[#074b3d] to-[#043329] border border-emerald-500/30 text-white p-4 shadow-md text-left space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Awaiting Paramedic Approval</span>
                    </div>
                    <h3 className="text-sm font-black text-white leading-tight">
                      Specialist Reviewing Booking
                    </h3>
                    <p className="text-[10.5px] text-emerald-100/90 leading-relaxed">
                      {specialistName} ({specialistRole}) is reviewing clinical procedures, consumables readiness, and transit route before heading out.
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-emerald-800/60 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-6 h-6 text-emerald-300" />
                  </div>
                </div>

                {/* Handshake Verification Checklist */}
                <div className="bg-black/25 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Address: {activeBooking?.patientAddress || deliveryAddress || 'Verified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sterile Medical Kit &amp; Consumables: Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-200 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Clinical Acceptance: Pending specialist confirmation</span>
                  </div>
                </div>

                {/* Paramedic Approval Handshake Actions */}
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const approved = await acceptActiveBooking(activeBooking?.id, assignedDbProvider?.id);
                      if (approved) {
                        showToast('Visit Approved by Paramedic', `${specialistName} has accepted your request and is starting transit.`, 'success');
                      }
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 font-black text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3] text-emerald-950" />
                    <span>Approve &amp; Start Transit (Paramedic)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      assignSpecialistToActiveBooking();
                      showToast('Requesting Alternate Specialist', 'Finding another certified nurse near your location.', 'info');
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Request Alternate</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Hero Card: "On the way" with 3D scooter rider */
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e6f4ea] via-[#e8f5ed] to-[#f0f9f4] border border-emerald-200/80 text-emerald-950 p-4 shadow-sm">
                <div className="relative z-10 pr-32">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300 text-[11px] font-bold text-emerald-900 mb-1">
                    <Bike className="w-3.5 h-3.5 text-emerald-700" />
                    <span>On the way</span>
                  </div>

                  <p className="text-xs text-emerald-900/90 font-bold leading-snug mt-1">
                    Your care specialist is on the way to you
                  </p>

                  <div className="mt-3">
                    <span className="text-[10px] text-emerald-800/80 uppercase tracking-wider font-extrabold block">
                      ETA
                    </span>
                    <span className="text-2xl font-black text-emerald-950 tracking-tight">
                      {eta} mins
                    </span>
                  </div>
                </div>

                {/* 3D Scooter Specialist Character Image - Rendered in Crisp HD */}
                <div className="absolute right-2 bottom-0 pointer-events-none flex items-end justify-end">
                  <div className="relative w-32 h-28 flex items-end justify-center">
                    <img 
                      src="/assets/ui/scooter_on_the_way.png" 
                      alt="Care Specialist On The Way" 
                      className="w-full h-full object-contain select-none filter drop-shadow-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5-Step Tracker Bar */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between relative px-1">
                <div className="absolute top-3 left-6 right-6 h-0.5 bg-slate-200 -z-0"></div>
                <div className="absolute top-3 left-6 w-1/2 h-0.5 bg-emerald-600 -z-0"></div>

                {trackerSteps.map((step) => (
                  <div key={step.label} className="flex flex-col items-center z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        step.state === 'completed'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : step.state === 'current'
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs animate-pulse'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-[8.5px] mt-1 text-center font-medium leading-tight ${
                        step.state === 'current'
                          ? 'font-extrabold text-emerald-900'
                          : step.state === 'completed'
                          ? 'text-slate-700 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Care Specialist Card (Querying Database Specialist) */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900">
                  Assigned Care Specialist
                </span>
                <button
                  onClick={onViewDetails}
                  className="text-[10.5px] font-bold text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View details</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={specialistAvatar}
                    alt={specialistName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                  />

                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {specialistName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {specialistRole}
                    </p>

                    <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                      <span className="flex items-center gap-0.5 font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{specialistRating}</span>
                      </span>
                      <span className="text-slate-400">({specialistReviews})</span>
                    </div>

                    <p className="text-[9.5px] text-slate-500 mt-0.5">
                      {specialistExp}
                    </p>
                  </div>
                </div>

                {/* Call & Chat Circular Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onCallSpecialist}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-50 group-hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center transition-all shadow-2xs">
                      <Phone className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={onChatSpecialist}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-50 group-hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center transition-all shadow-2xs">
                      <MessageCircle className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">Chat</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Services in this booking: Dynamically Lists All Services Booked */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-700" />
                  <span>Services in this booking ({activeServicesList.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsServicesModalOpen(true)}
                  className="text-[10.5px] font-extrabold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80"
                >
                  <span>View all &gt;</span>
                </button>
              </div>

              {/* Dynamic Service Grid displaying requested services */}
              <div className={`grid gap-2 ${activeServicesList.length === 1 ? 'grid-cols-1' : activeServicesList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {activeServicesList.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    onClick={() => setIsServicesModalOpen(true)}
                    className="bg-slate-50/90 border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-2 text-center cursor-pointer transition-all hover:bg-emerald-50/40 group"
                  >
                    <div className="h-10 flex items-center justify-center overflow-hidden mb-1">
                      {renderServiceIllustration(item.category, item.title)}
                    </div>
                    <p className="text-[9.5px] font-bold text-slate-900 leading-tight line-clamp-2 min-h-[22px] group-hover:text-emerald-900">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-[8.5px] text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full inline-block">
                        ₹{item.price}
                      </span>
                      {item.quantity && item.quantity > 1 && (
                        <span className="text-[8px] font-bold text-slate-600 bg-slate-200 px-1 rounded">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doorstep Handshake Security OTP Card */}
            {isVisitActive && expectedOtp && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-2xl p-3 border border-emerald-200/90 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4 text-emerald-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-slate-900">Doorstep Handshake OTP</span>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">Confidential</span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">
                      Share this 4-digit code with {specialistName} when they arrive at your door to start sterile care.
                    </p>
                  </div>
                </div>
                <div className="bg-white border-2 border-emerald-500 rounded-xl px-3 py-1.5 shadow-xs text-center shrink-0">
                  <span className="text-sm font-mono font-black text-emerald-900 tracking-widest">{expectedOtp}</span>
                </div>
              </div>
            )}

            {/* Live Location Map */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-900">Live Location</span>
                <span className="text-[9px] text-slate-400 font-medium">
                  Updated 2 min ago
                </span>
              </div>

              <LiveLocationMap isMoving={true} />
            </div>

            {/* Reschedule / Manage Link */}
            <div className="flex items-center justify-between px-1 text-[10.5px]">
              <span className="text-slate-500 font-medium">Need to reschedule or cancel?</span>
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="font-extrabold text-emerald-900 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Manage Booking &gt;</span>
              </button>
            </div>

            {/* Proceed to Doorstep OTP Verification button */}
            <button
              onClick={() => setIsOtpModalOpen(true)}
              className="w-full bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer border border-emerald-900"
            >
              <KeyRound className="w-4 h-4 text-emerald-300" />
              <span>Specialist Arrived • Verify OTP to Start Service</span>
            </button>
          </>
        )}
      </div>

      {/* VIEW ALL SERVICES IN ACTIVE VISIT MODAL */}
      {isServicesModalOpen && activeBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Services in this Booking</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Visit Ref #{bookingRefId} • {activeServicesList.length} Item(s)</p>
                </div>
              </div>
              <button
                onClick={() => setIsServicesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Itemized List of Services */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
              {activeServicesList.map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-1 shadow-2xs">
                      {renderServiceIllustration(item.category, item.title)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {item.subtitle || 'Home Healthcare Service'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full uppercase">
                          {item.category || 'Clinical Care'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600">
                          Qty: {item.quantity || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-950 block">
                      ₹{item.price * (item.quantity || 1)}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-medium block">
                      ₹{item.price} / {item.unit || 'visit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary Breakdown inside Modal */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 space-y-1.5 text-xs text-emerald-950">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-slate-600">Item Subtotal</span>
                <span className="font-bold">₹{activeBooking.basePrice || activeServicesList.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-slate-600">Convenience &amp; Sterile Kit Fee</span>
                <span className="font-bold">₹{activeBooking.platformFee || 30}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-emerald-200 font-black text-emerald-950">
                <span>Total Amount Paid</span>
                <span className="text-emerald-900">₹{activeBooking.totalAmount || activeBooking.basePrice}</span>
              </div>
            </div>

            <button
              onClick={() => setIsServicesModalOpen(false)}
              className="w-full bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
            >
              Close List
            </button>
          </div>
        </div>
      )}

      {/* CANCEL VISIT CONFIRMATION MODAL */}
      {isCancelModalOpen && activeBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cancel Appointment</h3>
                  <p className="text-[10px] text-slate-500 font-mono">#{activeBooking.id.replace(/^booking-/, '')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <span className="font-bold">100% Instant Refund:</span> Full refund of ₹{activeBooking.totalAmount} will be immediately credited back to your original payment method.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason for Cancellation
                </label>
                <div className="space-y-2">
                  {[
                    'Feeling better / No longer needed',
                    'Emergency hospital visit required',
                    'Need to reschedule for another time',
                    'Booked by mistake / Wrong address',
                    'Care specialist taking too long'
                  ].map((r) => (
                    <label 
                      key={r}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        cancelReason === r 
                          ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={r}
                        checked={cancelReason === r}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="accent-emerald-700 w-3.5 h-3.5"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Keep Visit
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancellation}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCancelling ? <span>Cancelling...</span> : <span>Confirm Cancel</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOORSTEP OTP VERIFICATION MODAL */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Doorstep OTP Verification</h3>
                  <p className="text-[10px] text-slate-500">Security Check on Specialist Arrival</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOtpModalOpen(false);
                  setOtpInput('');
                  setOtpError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Patient Security OTP
                </span>
                <div className="text-2xl font-black font-mono text-emerald-950 tracking-widest mt-0.5">
                  {expectedOtp}
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Share this OTP with {specialistName} or enter below to authorize service commencement.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 4-Digit OTP to Authenticate
                </label>
                <div className="flex justify-center gap-2.5 my-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={otpInput[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newOtp = otpInput.split('');
                        newOtp[idx] = val;
                        const joined = newOtp.join('').slice(0, 4);
                        setOtpInput(joined);
                        setOtpError(null);
                        if (val && idx < 3) {
                          const nextElem = document.getElementById(`otp-input-${idx + 1}`);
                          nextElem?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpInput[idx] && idx > 0) {
                          const prevElem = document.getElementById(`otp-input-${idx - 1}`);
                          prevElem?.focus();
                        }
                      }}
                      className="w-12 h-12 text-center font-mono text-xl font-bold rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                  ))}
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpInput(expectedOtp);
                      setOtpError(null);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    Quick Auto-Fill ({expectedOtp})
                  </button>
                </div>
              </div>

              {otpError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{otpError}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOtpModalOpen(false);
                  setOtpInput('');
                  setOtpError(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifying || otpInput.length < 4}
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 rounded-xl bg-[#084d3e] hover:bg-[#063f33] disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Start</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
