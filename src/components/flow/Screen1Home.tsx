import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  X, 
  Check,
  Clock,
  HelpCircle,
  Info
} from 'lucide-react';
import { HeaderBar } from './HeaderBar';
import { ALL_SERVICES_CATALOG, POPULAR_CATEGORIES } from '../../data/flowMockData';
import { ServiceItem as FlowServiceItem } from '../../types/flowTypes';
import { Booking } from '../../types/carex';
import { useCareX } from '../../context/CareXContext';
import {
  InjectionsCategoryIcon,
  WoundCareCategoryIcon,
  VitalsCategoryIcon,
  LabTestsCategoryIcon,
  PhysioCategoryIcon,
  ElderCareCategoryIcon,
  InjectionProcedureIllustration,
  IVDripProcedureIllustration,
  VaccineProcedureIllustration,
  IMIProcedureIllustration,
  BloodSampleIllustration,
  PhysioIllustration,
  WoundCareProcedureIllustration
} from './MedicalIllustrations';

interface Screen1HomeProps {
  onSelectService?: (service: FlowServiceItem) => void;
  onViewServiceDetails?: (service: FlowServiceItem) => void;
  onNavigateToCart?: () => void;
  onNavigateToTracking?: (step?: 3 | 4 | 5) => void;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
  onTabChange?: (tab: 'home' | 'book' | 'orders' | 'profile') => void;
  cartCount?: number;
  hasActiveBooking?: boolean;
  activeBooking?: Booking | null;
  deliveryAddress?: string;
}

export const Screen1Home: React.FC<Screen1HomeProps> = ({
  onSelectService,
  onViewServiceDetails,
  onNavigateToCart,
  onNavigateToTracking,
  onAddressClick,
  onCallSupportClick,
  onTabChange,
  cartCount = 0,
  hasActiveBooking = false,
  activeBooking = null,
  deliveryAddress
}) => {
  const { services: dbServices, isLoadingDb, cartItems, addToCart, showToast } = useCareX();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('injections');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  // 3D Category Icon Renderer
  const renderCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'injections':
        return <InjectionsCategoryIcon size={42} />;
      case 'wound':
        return <WoundCareCategoryIcon size={42} />;
      case 'vitals':
        return <VitalsCategoryIcon size={42} />;
      case 'lab':
        return <LabTestsCategoryIcon size={42} />;
      case 'physio':
        return <PhysioCategoryIcon size={42} />;
      case 'elder':
        return <ElderCareCategoryIcon size={42} />;
      default:
        return <InjectionsCategoryIcon size={42} />;
    }
  };

  // Procedure Illustration Renderer using newly attached assets for Physio, Injections & Wound Care
  const renderProcedureIllustration = (serv: FlowServiceItem, heightSize = 48) => {
    const cat = serv.category;
    const title = serv.title.toLowerCase();
    const id = serv.id.toLowerCase();

    if (cat === 'wound' || title.includes('wound') || title.includes('dressing') || title.includes('suture') || title.includes('ulcer') || title.includes('debridement')) {
      return <WoundCareProcedureIllustration size={heightSize} />;
    }
    if (id.includes('iv') || title.includes('iv') || title.includes('drip') || serv.imageType === 'iv-drip') {
      return <IVDripProcedureIllustration size={heightSize} />;
    }
    if (title.includes('vaccin') || serv.imageType === 'vaccine') {
      return <VaccineProcedureIllustration size={heightSize} />;
    }
    if (id.includes('im') || title.includes('im ') || title.includes('dose')) {
      return <IMIProcedureIllustration size={heightSize} />;
    }
    if (cat === 'lab' || title.includes('lab') || title.includes('blood') || title.includes('cbc')) {
      return <BloodSampleIllustration size={heightSize} />;
    }
    if (cat === 'physio' || title.includes('physio') || title.includes('rehab')) {
      return <PhysioIllustration size={heightSize} />;
    }
    return <InjectionProcedureIllustration size={heightSize} />;
  };

  // Convert DB services into FlowServiceItems
  const catalogList: FlowServiceItem[] = useMemo(() => {
    const getServiceCategory = (s: any): FlowServiceItem['category'] => {
      const cat = (s.category || '').toLowerCase();
      const name = (s.name || s.title || '').toLowerCase();
      const sub = (s.subCategory || '').toLowerCase();
      const id = (s.id || '').toLowerCase();

      if (cat === 'lab_tests' || cat === 'lab' || cat.includes('lab') || name.includes('blood') || name.includes('lab') || id.includes('lab') || name.includes('cbc')) {
        return 'lab';
      }
      if (cat === 'physiotherapy' || cat === 'physio' || cat.includes('physio') || name.includes('physio') || name.includes('rehab') || sub.includes('rehab') || name.includes('ortho')) {
        return 'physio';
      }
      if (cat === 'wound_care' || cat === 'wound' || cat.includes('wound') || name.includes('wound') || name.includes('dressing') || name.includes('suture') || name.includes('debridement') || name.includes('ulcer') || name.includes('sore') || sub.includes('wound')) {
        return 'wound';
      }
      if (cat === 'elder_care' || cat === 'elder' || cat.includes('elder') || name.includes('elder') || name.includes('hygiene') || name.includes('sponge') || name.includes('bedside sitting') || name.includes('feeding assistance') || name.includes('mobility assistance')) {
        return 'elder';
      }
      if (cat.includes('injection') || cat.includes('drip') || sub.includes('injection') || sub.includes('iv care') || id.includes('iv') || id.includes('inj') || name.includes('injection') || name.includes('drip') || name.includes('vaccin')) {
        return 'injections';
      }
      if (cat === 'basic_nursing' || cat === 'vitals' || cat.includes('vital') || name.includes('vital') || name.includes('ecg') || name.includes('catheter') || name.includes('nebuliz') || name.includes('oxygen') || name.includes('suction') || name.includes('ryles') || name.includes('reminders') || name.includes('observation')) {
        return 'vitals';
      }
      return 'injections';
    };

    if (dbServices && dbServices.length > 0) {
      return dbServices.map(s => ({
        id: s.id,
        title: s.name,
        subtitle: s.subCategory || s.description?.slice(0, 40) || 'Home Visit Care',
        price: s.price,
        unit: s.baseAmountLabel?.replace('per ', '') || 'visit',
        category: getServiceCategory(s),
        imageType: s.id.includes('iv')
          ? 'iv-drip'
          : s.id.includes('vac')
          ? 'vaccine'
          : s.id.includes('im')
          ? 'im-injection'
          : s.id.includes('blood') || s.id.includes('lab')
          ? 'blood-test'
          : s.id.includes('physio')
          ? 'physio'
          : 'injection',
        duration: s.duration || '30 mins',
        description: s.description,
        includes: s.includes
      }));
    }
    return ALL_SERVICES_CATALOG;
  }, [dbServices]);

  // Filter services by search or category
  const displayedServices = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return catalogList.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.subtitle.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }
    return catalogList.filter((s) => s.category === selectedCategory);
  }, [catalogList, searchQuery, selectedCategory]);

  const activeCategoryName = POPULAR_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Injections';

  const handleTrackBookingClick = () => {
    if (activeBooking?.status === 'in_progress' || activeBooking?.status === 'service_started') {
      onNavigateToTracking?.(5);
    } else {
      onNavigateToTracking?.(4);
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] text-slate-800 text-left relative min-h-screen">
      {/* Top Header */}
      <HeaderBar 
        currentAddress={deliveryAddress} 
        onAddressClick={onAddressClick} 
        onCallSupportClick={onCallSupportClick} 
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 scrollbar-thin pb-24">
        {/* Active Visit Banner ONLY IF active booking exists */}
        {hasActiveBooking && activeBooking && !['completed', 'cancelled'].includes(activeBooking.status) ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857] text-white p-3 shadow-lg border border-emerald-800 animate-in fade-in duration-200">
            <div className="relative z-10 pr-28">
              <span className="text-[9.5px] tracking-wider text-emerald-200/90 font-mono font-medium uppercase block">
                REF #{activeBooking.id.replace(/^booking-/, '')}
              </span>

              <div className="flex items-center gap-1 mt-0.5">
                <h2 className="text-xs font-extrabold tracking-tight">
                  Visit Confirmed
                </h2>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300/30" />
              </div>

              <p className="text-[10px] text-emerald-100 font-medium mt-0.5 truncate max-w-[190px]">
                {activeBooking.providerName || 'Care Specialist'} •{' '}
                {activeBooking.status === 'in_progress' || activeBooking.status === 'service_started'
                  ? 'Care Underway'
                  : 'On the way'}
              </p>

              <button
                onClick={handleTrackBookingClick}
                className="mt-2 inline-flex items-center gap-1 bg-white hover:bg-emerald-50 text-emerald-900 text-[9.5px] font-bold px-2.5 py-1 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Track Visit</span>
                <ChevronRight className="w-3 h-3 text-emerald-900" />
              </button>
            </div>

            <div className="absolute right-2 bottom-1 pointer-events-none flex items-center justify-end">
              <div className="relative w-20 h-22 rounded-xl overflow-hidden border border-white/20 shadow-xl bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent backdrop-blur-xs p-1 flex items-center justify-center">
                <img 
                  src="/assets/ui/hero_doctor_seamless.jpg" 
                  alt="Care Specialist Doctor" 
                  className="w-full h-full object-contain object-bottom select-none"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search injections, dressing, checkups..."
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-8 pr-9 py-1.5 text-xs placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 shadow-2xs font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Filter options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1. Category Cards with Attached Images for Physio, Injections & Wound Care */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">What do you need today?</h3>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {POPULAR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id && !searchQuery;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`flex flex-col items-center p-0.5 rounded-2xl transition-all border cursor-pointer overflow-visible ${
                    isSelected
                      ? 'bg-emerald-50/90 border-2 border-emerald-600 shadow-xs ring-2 ring-emerald-500/20 scale-102'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:scale-101'
                  }`}
                  title={cat.name}
                >
                  <div className="flex items-center justify-center mb-0.5">
                    {renderCategoryIcon(cat.id)}
                  </div>
                  <span
                    className={`text-[9px] leading-tight text-center break-words w-full px-0.5 ${
                      isSelected ? 'font-black text-emerald-950' : 'font-bold text-slate-700'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Compact Service Cards (Reduced Overall Card Padding & Margins without shrinking GIF/image height) */}
        <section className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
                {searchQuery ? `Search Results (${displayedServices.length})` : `Services for ${activeCategoryName}`}
              </h3>
              <p className="text-[9px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>100% Sterile • Doorstep Care</span>
              </p>
            </div>
            {totalCartCount > 0 && (
              <button
                onClick={onNavigateToCart}
                className="text-[9.5px] font-bold text-emerald-800 hover:underline flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/90 shadow-2xs cursor-pointer"
              >
                <span>View Cart ({totalCartCount})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {displayedServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center border border-slate-200/80 space-y-2 text-slate-800 shadow-2xs">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">No services found</p>
              <p className="text-[10px] text-slate-500">Try searching for injections, vitals, or dressing checkups.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('injections'); }}
                className="text-xs font-bold text-emerald-700 hover:underline pt-1 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* COMPACT 2-COLUMN GRID WITH SLEEK SNUG CARDS */
            <div className="grid grid-cols-2 gap-2">
              {displayedServices.map((serv) => {
                const cartItem = cartItems.find((c) => c.service.id === serv.id);
                const qty = cartItem ? cartItem.quantity : 0;

                return (
                  <div
                    key={serv.id}
                    onClick={() => setExpandedServiceId(serv.id)}
                    className="bg-white border border-slate-200/90 hover:border-emerald-400/80 rounded-xl p-1.5 shadow-2xs hover:shadow-xs flex flex-col justify-between transition-all group cursor-pointer text-left overflow-hidden active:scale-98 relative"
                    title={`Click to view clinical details for ${serv.title}`}
                  >
                    {/* Prominent Visual/GIF Container (Height preserved at 48px) */}
                    <div className="w-full rounded-lg overflow-hidden flex items-center justify-center bg-slate-50/80">
                      {renderProcedureIllustration(serv, 48)}
                    </div>

                    {/* Untruncated Service Title with tight padding */}
                    <div className="my-1">
                      <h4 className="text-[11px] font-bold text-slate-900 leading-[1.15] break-words">
                        {serv.title}
                      </h4>
                    </div>

                    {/* Tight Bottom Row: Price & Simple "+ ADD" Button */}
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1 mt-auto">
                      <div>
                        <span className="text-[11px] font-black text-slate-900">₹{serv.price}</span>
                        <span className="text-[8px] text-slate-400">/{serv.unit}</span>
                      </div>

                      {qty > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToCart?.();
                          }}
                          className="bg-emerald-900 hover:bg-emerald-950 text-white font-black text-[9px] py-0.5 px-2 rounded-md transition-all flex items-center gap-0.5 shadow-2xs cursor-pointer border border-emerald-700"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3] text-emerald-300" />
                          <span>ADDED</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasActiveBooking && activeBooking && !['completed', 'cancelled'].includes(activeBooking.status || '')) {
                              showToast('Active Visit In Progress', 'You cannot book another visit until your current visit is completed or cancelled.', 'warning');
                              onNavigateToTracking?.();
                              return;
                            }
                            addToCart(serv);
                          }}
                          className="bg-[#073b34] hover:bg-[#052e28] text-white font-bold text-[9px] py-0.5 px-2 rounded-md transition-all active:scale-95 flex items-center gap-0.5 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. SERVICE DETAILS POPUP MODAL */}
        {expandedServiceId && (() => {
          const modalServ = catalogList.find((s) => s.id === expandedServiceId);
          if (!modalServ) return null;
          const cartItem = cartItems.find((c) => c.service.id === modalServ.id);
          const qty = cartItem ? cartItem.quantity : 0;

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setExpandedServiceId(null)}
            >
              <div
                className="relative w-full max-w-sm bg-gradient-to-b from-[#073b34] via-[#052e28] to-[#03211c] border border-teal-400/40 rounded-3xl shadow-2xl text-white max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* FIXED STICKY TOP HEADER WITH CLOSE (X) BUTTON */}
                <div className="p-3 px-4 flex items-center justify-between border-b border-teal-500/30 shrink-0 bg-[#073b34] z-30 sticky top-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-200 uppercase tracking-wider">
                      Clinical Service Specifications
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedServiceId(null)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                    title="Close popup"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* SCROLLABLE MODAL CONTENT AREA WITH MINIMALIST TRANSPARENT SCROLLBAR */}
                <div className="overflow-y-auto p-4 space-y-3 flex-1 scrollbar-transparent">
                  {/* Procedure Visual */}
                  <div className="w-full h-24 rounded-2xl relative overflow-hidden bg-white/10 border border-teal-500/30 flex items-center justify-center p-2">
                    {renderProcedureIllustration(modalServ, 80)}
                  </div>

                  {/* Header Titles */}
                  <div>
                    <h3 className="text-base font-extrabold text-emerald-100 font-heading leading-snug">
                      {modalServ.title}
                    </h3>
                    <p className="text-xs text-teal-300/80 font-medium mt-0.5">
                      {modalServ.subtitle || 'Doorstep Clinical Visit'}
                    </p>
                  </div>

                  {/* Overview */}
                  <div className="bg-teal-950/70 p-2.5 rounded-2xl border border-teal-500/25 space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                      Service Overview
                    </span>
                    <p className="text-xs text-teal-100/90 leading-relaxed">
                      {modalServ.description || 'Doorstep clinical care administered by certified registered nurses with hospital-grade sterile equipment.'}
                    </p>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div className="bg-teal-950/80 p-2.5 rounded-xl border border-teal-500/30 space-y-1">
                      <span className="text-teal-300 font-bold block flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Sterile Guarantee
                      </span>
                      <span className="text-teal-100/80 block">100% Single-use kit unsealed at bedside.</span>
                    </div>

                    <div className="bg-teal-950/80 p-2.5 rounded-xl border border-teal-500/30 space-y-1">
                      <span className="text-teal-300 font-bold block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Visit Duration
                      </span>
                      <span className="text-teal-100/80 block">{modalServ.duration || '20–30 mins'} doorstep visit.</span>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-teal-950/60 p-2.5 rounded-2xl border border-teal-500/20 space-y-1">
                    <span className="text-[10.5px] font-bold text-emerald-300 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-emerald-400" />
                      Preparation &amp; Guidelines
                    </span>
                    <ul className="text-[10px] text-teal-100/80 space-y-1 list-disc list-inside">
                      <li>Keep doctor's prescription ready (if applicable).</li>
                      <li>Ensure a well-lit, clean seated space for the nurse.</li>
                      <li>Our specialist verifies vitals prior to starting.</li>
                    </ul>
                  </div>

                  {/* FAQs */}
                  <div className="bg-teal-950/60 p-2.5 rounded-2xl border border-teal-500/20 space-y-1.5">
                    <span className="text-[10.5px] font-bold text-emerald-300 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Frequently Asked Questions
                    </span>
                    <div className="space-y-1 text-[10px]">
                      <div>
                        <p className="font-bold text-emerald-200">Q: Is prescription mandatory?</p>
                        <p className="text-teal-100/80">A: Nurse checks Rx on arrival or arranges quick tele-consultation.</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-200">Q: How soon will the nurse arrive?</p>
                        <p className="text-teal-100/80">A: Assigned nearby specialist arrives within 15–30 minutes.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STICKY BOTTOM ACTION BAR */}
                <div className="p-3 px-4 border-t border-teal-500/30 flex items-center justify-between gap-2 shrink-0 bg-[#03211c]">
                  <div>
                    <span className="text-sm font-black text-amber-300">₹{modalServ.price}</span>
                    <span className="text-xs text-teal-200/70"> /{modalServ.unit}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (hasActiveBooking && activeBooking && !['completed', 'cancelled'].includes(activeBooking.status || '')) {
                        showToast('Active Visit In Progress', 'You cannot book another visit until your current visit is completed or cancelled.', 'warning');
                        setExpandedServiceId(null);
                        onNavigateToTracking?.();
                        return;
                      }
                      addToCart(modalServ);
                      setExpandedServiceId(null);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{qty > 0 ? 'ADD AGAIN' : 'ADD TO CART'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Trust & Safety Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-100" />
          </div>
          <div className="text-left">
            <h5 className="text-[10px] font-bold text-emerald-950 leading-tight">
              Safe. Reliable. At Your Doorstep.
            </h5>
            <p className="text-[8.5px] text-emerald-800/80 leading-snug font-medium">
              Verified professionals • Hygienic care • On-time service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
