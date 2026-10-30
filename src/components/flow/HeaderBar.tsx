import React from 'react';
import { MapPin, Phone, ChevronDown, Plus } from 'lucide-react';
import { useCareX } from '../../context/CareXContext';

interface HeaderBarProps {
  currentAddress?: string;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
  compact?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentAddress,
  onAddressClick,
  onCallSupportClick,
  compact = false
}) => {
  const { isLoggedIn, selectedAddress, deliveryAddress, openAuthModal } = useCareX();

  const activeAddressText = currentAddress || selectedAddress?.address || deliveryAddress;
  const activeLabel = selectedAddress?.label || 'HOME';

  const handleHeaderLocationClick = () => {
    if (!isLoggedIn) {
      openAuthModal('patient', 'login');
      return;
    }
    if (onAddressClick) {
      onAddressClick();
    }
  };

  return (
    <header className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2 select-none">
      {/* Left: Delivery Location */}
      <div
        onClick={handleHeaderLocationClick}
        className="flex items-start gap-2 cursor-pointer hover:opacity-85 transition-opacity max-w-[65%]"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
          <MapPin className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="flex flex-col text-left overflow-hidden">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">Delivering to</span>
          </div>
          {isLoggedIn && activeAddressText ? (
            <>
              <div className="flex items-center gap-1 font-bold text-slate-900 text-xs tracking-tight">
                <span className="uppercase">{activeLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-600 shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{activeAddressText}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
              <span>Select Delivery Location</span>
              <ChevronDown className="w-3 h-3 text-emerald-700 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Right: 1-800-MAP2MEDIC Hotline */}
      <button
        onClick={onCallSupportClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-[10px] font-bold transition-all shadow-2xs active:scale-95 shrink-0"
        title="Call 1-800-MAP2MEDIC"
      >
        <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center">
          <Phone className="w-2.5 h-2.5" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[8px] font-normal text-emerald-700">1-800-</span>
          <span className="text-[9px] font-bold tracking-tight">MAP2MEDIC</span>
        </div>
      </button>
    </header>
  );
};
