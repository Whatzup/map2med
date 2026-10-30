import React, { useState, useEffect } from 'react';
import { useCareX } from '../../context/CareXContext';
import { Booking } from '../../types/carex';
import { ServiceIcon } from '../ServiceIcon';
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  X, 
  Ban, 
  ShieldAlert,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface ActiveBookingGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBooking: Booking | null;
}

export const ActiveBookingGuardModal: React.FC<ActiveBookingGuardModalProps> = ({
  isOpen,
  onClose,
  activeBooking
}) => {
  const { setActiveTab, cancelBooking, showToast, providers } = useCareX();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeBooking) return null;

  const matchedProvider = providers.find(p => p.id === activeBooking.providerId || p.name === activeBooking.providerName);
  const providerDisplayName = activeBooking.providerName || (matchedProvider ? matchedProvider.name : 'Verified Paramedic');

  const handleViewOngoing = () => {
    onClose();
    setActiveTab('patient-portal');
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelBooking(activeBooking.id, 'User requested cancellation to book a new appointment');
      setShowCancelConfirm(false);
      onClose();
    } catch (err: any) {
      showToast('Cancellation Failed', err.message || 'Could not cancel booking.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending Dispatch', bg: 'bg-amber-100', text: 'text-amber-800' },
    confirmed: { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    scheduled: { label: 'Scheduled', bg: 'bg-teal-100', text: 'text-teal-800' },
    assigned: { label: 'Paramedic Assigned', bg: 'bg-teal-100', text: 'text-teal-800' },
    en_route: { label: 'En Route 🚗', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    arrived: { label: 'Arrived at Doorstep 🏠', bg: 'bg-blue-100', text: 'text-blue-800' },
    in_progress: { label: 'In Progress 🩺', bg: 'bg-purple-100', text: 'text-purple-800' },
  };

  const statusKey = (activeBooking.status || '').toLowerCase();
  const statusInfo = statusBadges[statusKey] || { 
    label: (activeBooking.status || 'ACTIVE').toUpperCase(), 
    bg: 'bg-teal-100', 
    text: 'text-teal-800' 
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="active-booking-guard-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-5 sm:p-6 text-white relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 pr-10">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-100 block">Single Active Booking Policy</span>
                <h3 id="active-booking-guard-title" className="text-lg sm:text-xl font-bold font-heading text-white">
                  You have an ongoing appointment
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              title="Close dialog (Esc)"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-all shadow-md active:scale-95 cursor-pointer z-30 shrink-0"
            >
              <X className="w-6 h-6 text-white stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Exact Required Explanatory Body */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Active visit in progress</span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              You have an active visit scheduled with <strong>{providerDisplayName}</strong> for <strong>{activeBooking.date} at {activeBooking.timeSlot}</strong>. To book a new service, please complete or cancel your ongoing appointment.
            </p>
          </div>

          {/* Active Booking Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-[11px] font-mono font-bold text-slate-500">Ref ID: #{activeBooking.id}</span>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              {matchedProvider?.avatar ? (
                <img 
                  src={matchedProvider.avatar} 
                  alt={providerDisplayName} 
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs" 
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0 border border-teal-200">
                  <ServiceIcon 
                    category={activeBooking.category} 
                    serviceName={activeBooking.serviceName} 
                    className="w-6 h-6 text-teal-700" 
                  />
                </div>
              )}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <ServiceIcon 
                    category={activeBooking.category} 
                    serviceName={activeBooking.serviceName} 
                    className="w-4 h-4 text-teal-700 shrink-0" 
                  />
                  <h4 className="text-sm font-bold text-slate-900 truncate">{activeBooking.serviceName}</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{activeBooking.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{activeBooking.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{activeBooking.patientAddress}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold pt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Clinician: {providerDisplayName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Confirmation Sub-dialog */}
          {showCancelConfirm ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <Ban className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-950">Confirm Cancellation of Appointment #{activeBooking.id}?</h4>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Full refund of ₹{activeBooking.totalAmount} will be immediately initiated to your original payment method.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel Visit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleViewOngoing}
                className="w-full sm:flex-1 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <span>View Ongoing Booking</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel Active Booking
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
