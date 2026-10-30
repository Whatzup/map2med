import React from 'react';
import { PhoneFrame } from './PhoneFrame';
import { Screen1Home } from './Screen1Home';
import { Screen2Cart } from './Screen2Cart';
import { Screen3Assignment } from './Screen3Assignment';
import { Screen4Tracking } from './Screen4Tracking';
import { Screen5ServiceStarted } from './Screen5ServiceStarted';
import { CartItem, ServiceItem } from '../../types/flowTypes';
import { ArrowRight, Maximize2 } from 'lucide-react';

interface PanoramicFlowViewProps {
  cartItems: CartItem[];
  onSelectService: (s: ServiceItem) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onFocusScreen: (screenNumber: 1 | 2 | 3 | 4 | 5) => void;
  onCallSpecialist: () => void;
  onChatSpecialist: () => void;
  onViewDetails: () => void;
  onAddressClick: () => void;
  onCallSupportClick: () => void;
}

export const PanoramicFlowView: React.FC<PanoramicFlowViewProps> = ({
  cartItems,
  onSelectService,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onFocusScreen,
  onCallSpecialist,
  onChatSpecialist,
  onViewDetails,
  onAddressClick,
  onCallSupportClick
}) => {
  return (
    <div className="w-full flex flex-col items-center py-6 px-4">
      {/* Header matching image */}
      <div className="text-center mb-6 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Patient Booking &amp; Service Delivery Flow
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
          End-to-end at-home healthcare patient journey across 5 integrated mobile touchpoints
        </p>

        {/* Decorative connecting flow curve line */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-4 text-slate-300">
          <div className="w-12 h-0.5 bg-slate-300 rounded-full"></div>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <div className="w-64 h-0.5 bg-dashed border-b-2 border-dashed border-slate-300"></div>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <div className="w-12 h-0.5 bg-slate-300 rounded-full"></div>
        </div>
      </div>

      {/* Horizontal Flow container of 5 screens */}
      <div className="w-full overflow-x-auto pb-8 pt-2 scrollbar-thin">
        <div className="flex items-center justify-start xl:justify-center gap-3 sm:gap-4 md:gap-5 min-w-max px-4">
          {/* SCREEN 1 */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                onClick={() => onFocusScreen(1)}
                className="absolute top-10 right-6 z-40 bg-white/90 hover:bg-white text-emerald-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Focus Screen 1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <PhoneFrame screenNumber={1} screenLabel="SCREEN 1">
                <Screen1Home
                  cartCount={cartItems.length}
                  onSelectService={onSelectService}
                  onNavigateToCart={() => onFocusScreen(2)}
                  onNavigateToTracking={() => onFocusScreen(4)}
                  onAddressClick={onAddressClick}
                  onCallSupportClick={onCallSupportClick}
                />
              </PhoneFrame>
            </div>

            {/* Connecting Green Flow Arrow */}
            <div className="flex flex-col items-center justify-center text-emerald-600 px-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shadow-xs">
                <ArrowRight className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* SCREEN 2 */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                onClick={() => onFocusScreen(2)}
                className="absolute top-10 right-6 z-40 bg-white/90 hover:bg-white text-emerald-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Focus Screen 2"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <PhoneFrame screenNumber={2} screenLabel="SCREEN 2">
                <Screen2Cart
                  cartItems={cartItems}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                  onClearCart={onClearCart}
                  onAddMore={() => onFocusScreen(1)}
                  onProceedToBooking={() => onFocusScreen(3)}
                  onBackToHome={() => onFocusScreen(1)}
                  onAddressClick={onAddressClick}
                  onCallSupportClick={onCallSupportClick}
                />
              </PhoneFrame>
            </div>

            {/* Connecting Green Flow Arrow */}
            <div className="flex flex-col items-center justify-center text-emerald-600 px-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shadow-xs">
                <ArrowRight className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* SCREEN 3 */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                onClick={() => onFocusScreen(3)}
                className="absolute top-10 right-6 z-40 bg-white/90 hover:bg-white text-emerald-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Focus Screen 3"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <PhoneFrame screenNumber={3} screenLabel="SCREEN 3">
                <Screen3Assignment
                  onSpecialistAssigned={() => onFocusScreen(4)}
                  onAddressClick={onAddressClick}
                  onCallSupportClick={onCallSupportClick}
                />
              </PhoneFrame>
            </div>

            {/* Connecting Green Flow Arrow */}
            <div className="flex flex-col items-center justify-center text-emerald-600 px-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shadow-xs">
                <ArrowRight className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* SCREEN 4 */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                onClick={() => onFocusScreen(4)}
                className="absolute top-10 right-6 z-40 bg-white/90 hover:bg-white text-emerald-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Focus Screen 4"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <PhoneFrame screenNumber={4} screenLabel="SCREEN 4">
                <Screen4Tracking
                  onCallSpecialist={onCallSpecialist}
                  onChatSpecialist={onChatSpecialist}
                  onViewDetails={onViewDetails}
                  onManageBooking={() => onFocusScreen(3)}
                  onSpecialistArrived={() => onFocusScreen(5)}
                  onAddressClick={onAddressClick}
                  onCallSupportClick={onCallSupportClick}
                />
              </PhoneFrame>
            </div>

            {/* Connecting Green Flow Arrow */}
            <div className="flex flex-col items-center justify-center text-emerald-600 px-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shadow-xs">
                <ArrowRight className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* SCREEN 5 */}
          <div className="flex items-center">
            <div className="relative group">
              <button
                onClick={() => onFocusScreen(5)}
                className="absolute top-10 right-6 z-40 bg-white/90 hover:bg-white text-emerald-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Focus Screen 5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <PhoneFrame screenNumber={5} screenLabel="SCREEN 5">
                <Screen5ServiceStarted
                  onCallSpecialist={onCallSpecialist}
                  onChatSpecialist={onChatSpecialist}
                  onViewDetails={onViewDetails}
                  onAddressClick={onAddressClick}
                  onCallSupportClick={onCallSupportClick}
                  onResetFlow={() => onFocusScreen(1)}
                />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
