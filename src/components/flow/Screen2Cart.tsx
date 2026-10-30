import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Minus, 
  Info, 
  Users, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  FileCheck, 
  Upload, 
  Camera, 
  Check, 
  AlertCircle, 
  Tag, 
  User, 
  Star, 
  CheckCircle2,
  Stethoscope,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { HeaderBar } from './HeaderBar';
import { useCareX } from '../../context/CareXContext';
import { CartItem } from '../../types/flowTypes';
import { HealthcareProvider } from '../../types/carex';
import {
  InjectionProcedureIllustration,
  IVDripProcedureIllustration,
  VaccineProcedureIllustration,
  IMIProcedureIllustration,
  BloodSampleIllustration,
  PhysioIllustration
} from './MedicalIllustrations';

export interface CartBookingMeta {
  patientName: string;
  patientAge: number;
  patientGender?: string;
  isForFamily: boolean;
  familyRelation?: string;
  rxUploaded: boolean;
  rxFileName?: string;
  rxConfirmed: boolean;
  customBasePrice: number;
  customTotalAmount: number;
  customBookingItems: any[];
  itemPackages: Record<string, 'single' | 'pack3'>;
  careAssignmentMode?: 'auto' | 'manual';
  selectedNurseId?: string;
  selectedProvider?: HealthcareProvider;
}

interface Screen2CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onAddMore: () => void;
  onProceedToBooking: (meta?: CartBookingMeta) => void;
  onBackToHome: () => void;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
  onTabChange?: (tab: 'home' | 'book' | 'orders' | 'profile') => void;
  deliveryAddress?: string;
}

export const Screen2Cart: React.FC<Screen2CartProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddMore,
  onProceedToBooking,
  onBackToHome,
  onAddressClick,
  onCallSupportClick,
  onTabChange,
  deliveryAddress
}) => {
  const { selectedAddress, patientUser, providers, showToast, activeBooking, hasActiveBooking } = useCareX();

  const isVisitActive = Boolean(
    hasActiveBooking && 
    activeBooking && 
    !['completed', 'cancelled'].includes((activeBooking.status || '').toLowerCase())
  );

  // 1. Multi-Visit Course Package State per service item
  const [itemPackages, setItemPackages] = useState<Record<string, 'single' | 'pack3'>>({});

  // 2. Beneficiary / "Who is this visit for?" State
  const [beneficiary, setBeneficiary] = useState<'myself' | 'family'>('myself');
  const [familyRelation, setFamilyRelation] = useState<'Mother' | 'Father' | 'Parent' | 'Spouse' | 'Child' | 'Other'>('Mother');
  const [familyPatientName, setFamilyPatientName] = useState('');
  const [familyPatientAge, setFamilyPatientAge] = useState('');
  const [familyPatientGender, setFamilyPatientGender] = useState<'Female' | 'Male' | 'Other'>('Female');

  // 3. Care Specialist Assignment (Auto-assign vs Manual Nurse Selection)
  const [careAssignmentMode, setCareAssignmentMode] = useState<'auto' | 'manual'>('auto');
  const [selectedNurseId, setSelectedNurseId] = useState<string>(() => providers.find(p => p.isAvailable)?.id || providers[0]?.id || 'prov-priya-nair');

  // 4. Clinical Compliance & Rx Readiness State
  const [isRxConfirmed, setIsRxConfirmed] = useState(true);
  const [uploadedRxFileName, setUploadedRxFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if any cart item has prescription requirements
  const hasRxRequirement = cartItems.some(item => {
    const cat = (item.service.category || '').toLowerCase();
    const id = (item.service.id || '').toLowerCase();
    const title = (item.service.title || '').toLowerCase();
    return cat.includes('injection') || cat.includes('iv') || cat.includes('wound') ||
           id.includes('inj') || id.includes('iv') || id.includes('im') || id.includes('drip') ||
           title.includes('injection') || title.includes('iv') || title.includes('im') || title.includes('drip') || title.includes('wound');
  });

  // Check if item is eligible for 3-visit recurring package
  const isEligibleForMultiVisit = (item: CartItem) => {
    const cat = (item.service.category || '').toLowerCase();
    const id = (item.service.id || '').toLowerCase();
    const title = (item.service.title || '').toLowerCase();
    return cat.includes('injection') || cat.includes('wound') ||
           id.includes('inj') || id.includes('wound') || id.includes('im') ||
           title.includes('injection') || title.includes('wound') || title.includes('dressing');
  };

  const getItemPrice = (item: CartItem) => {
    const isPack = itemPackages[item.service.id] === 'pack3';
    if (isPack) {
      return Math.round(item.service.price * 3 * 0.85);
    }
    return item.service.price * item.quantity;
  };

  const getPackSavings = (item: CartItem) => {
    const normal3Price = item.service.price * 3;
    const discounted3Price = Math.round(item.service.price * 3 * 0.85);
    return normal3Price - discounted3Price;
  };

  const subTotal = cartItems.reduce((acc, item) => acc + getItemPrice(item), 0);
  const convenienceFee = cartItems.length > 0 ? 30 : 0;
  const totalAmount = subTotal + convenienceFee;

  const totalPackSavings = cartItems.reduce((acc, item) => {
    if (itemPackages[item.service.id] === 'pack3') {
      return acc + getPackSavings(item);
    }
    return acc;
  }, 0);

  const activeAddressText = selectedAddress?.address || deliveryAddress || patientUser.address || 'Select delivery address';
  const activeAddressLabel = selectedAddress?.label || 'HOME';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedRxFileName(file.name);
      setIsRxConfirmed(true);
      showToast('Prescription Attached', `${file.name} uploaded for clinical verification.`, 'success');
    }
  };

  const handleSimulateRxUpload = () => {
    setUploadedRxFileName('Rx_Clinical_Prescription_Signed.pdf');
    setIsRxConfirmed(true);
    showToast('Prescription Attached', 'Digital prescription document verified for visit.', 'success');
  };

  const handleProceed = () => {
    const finalPatientName = beneficiary === 'family' && familyPatientName.trim()
      ? familyPatientName.trim()
      : (patientUser.name || 'Patient User');

    const finalPatientAge = beneficiary === 'family' && familyPatientAge.trim()
      ? parseInt(familyPatientAge, 10) || 45
      : (patientUser.age || 35);

    const finalPatientGender = beneficiary === 'family' ? familyPatientGender : (patientUser.gender || 'Male');

    const customBookingItems = cartItems.map((c, idx) => {
      const isPack = itemPackages[c.service.id] === 'pack3';
      const itemPrice = isPack ? Math.round(c.service.price * 3 * 0.85) : c.service.price * c.quantity;
      return {
        id: `item-${idx + 1}`,
        serviceId: c.service.id,
        title: isPack ? `${c.service.title} (3-Visit Course Pack)` : c.service.title,
        subtitle: isPack ? '3-Visit Care Course (15% Saved)' : c.service.subtitle,
        price: itemPrice,
        unit: isPack ? '3 visits' : c.service.unit,
        category: c.service.category,
        quantity: isPack ? 3 : c.quantity,
        status: 'pending' as const,
      };
    });

    const selectedNurse = careAssignmentMode === 'manual'
      ? providers.find(p => p.id === selectedNurseId) || providers[0]
      : undefined;

    const meta: CartBookingMeta = {
      patientName: finalPatientName,
      patientAge: finalPatientAge,
      patientGender: finalPatientGender,
      isForFamily: beneficiary === 'family',
      familyRelation: beneficiary === 'family' ? familyRelation : undefined,
      rxUploaded: Boolean(uploadedRxFileName),
      rxFileName: uploadedRxFileName || undefined,
      rxConfirmed: isRxConfirmed,
      customBasePrice: subTotal,
      customTotalAmount: totalAmount,
      customBookingItems,
      itemPackages,
      careAssignmentMode,
      selectedNurseId: careAssignmentMode === 'manual' ? selectedNurseId : undefined,
      selectedProvider: selectedNurse
    };

    onProceedToBooking(meta);
  };

  // 3D Procedural Thumbnail Renderer for Cart Items
  const renderCartThumbnail = (serv: any) => {
    const cat = (serv.category || '').toLowerCase();
    const id = (serv.id || '').toLowerCase();
    const title = (serv.title || '').toLowerCase();

    if (id.includes('iv') || title.includes('iv') || title.includes('drip')) {
      return <IVDripProcedureIllustration size={64} />;
    }
    if (title.includes('vaccin')) {
      return <VaccineProcedureIllustration size={64} />;
    }
    if (id.includes('im') || title.includes('im ')) {
      return <IMIProcedureIllustration size={64} />;
    }
    if (cat === 'lab' || title.includes('lab') || title.includes('blood')) {
      return <BloodSampleIllustration size={64} />;
    }
    if (cat === 'physio' || title.includes('physio')) {
      return <PhysioIllustration size={64} />;
    }
    return <InjectionProcedureIllustration size={64} />;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] text-slate-800 text-left relative min-h-screen">
      {/* Top Header */}
      <HeaderBar 
        currentAddress={deliveryAddress} 
        onAddressClick={onAddressClick} 
        onCallSupportClick={onCallSupportClick} 
      />

      {/* Cart Title Bar matching Screenshot 4 */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>My Cart ({cartItems.length} Services)</span>
        </button>

        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-[10.5px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Scrollable Cart Content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 scrollbar-thin pb-32">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs my-6 flex flex-col items-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-emerald-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Your Cart is Empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-5">
              Explore our clinical healthcare services and book certified specialists to your doorstep.
            </p>
            <button
              onClick={onAddMore}
              className="bg-[#084d3e] hover:bg-[#063f33] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Browse Services</span>
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List matching Screenshot 4 */}
            <div className="space-y-2.5">
              {cartItems.map((item) => {
                const isPack = itemPackages[item.service.id] === 'pack3';
                const eligibleMulti = isEligibleForMultiVisit(item);

                return (
                  <div
                    key={item.service.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left 3D Thumbnail Visual */}
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-emerald-50/50 flex items-center justify-center p-1 border border-slate-100 shrink-0">
                        {renderCartThumbnail(item.service)}
                      </div>

                      {/* Middle Service Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                          {item.service.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate font-medium">
                          {item.service.subtitle || 'Home Visit Care'}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-black text-slate-900">
                            ₹{getItemPrice(item)}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                            {isPack ? '3 Visits Pack' : 'One-time • At Home'}
                          </span>
                        </div>
                      </div>

                      {/* Right Top Trash & Bottom Stepper */}
                      <div className="flex flex-col items-end justify-between h-16 shrink-0">
                        <button
                          onClick={() => onRemoveItem(item.service.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {!isPack ? (
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(item.service.id, -1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 text-xs font-black text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.service.id, 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            3 Visits
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Multi-Visit Course Package Upsell Chip */}
                    {eligibleMulti && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-700" />
                          <span>Course Package:</span>
                        </span>

                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setItemPackages(prev => ({ ...prev, [item.service.id]: 'single' }))}
                            className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              !isPack 
                                ? 'bg-white text-slate-900 shadow-2xs' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Single Visit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setItemPackages(prev => ({ ...prev, [item.service.id]: 'pack3' }));
                              showToast('3-Visit Pack Applied', '15% package savings applied to your course.', 'success');
                            }}
                            className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isPack 
                                ? 'bg-emerald-700 text-white shadow-2xs' 
                                : 'text-emerald-800 hover:text-emerald-950 font-extrabold'
                            }`}
                          >
                            <span>3-Visit Pack (Save 15%)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add More Services Pill Button matching Screenshot 4 */}
            <button
              onClick={onAddMore}
              className="w-full py-2.5 bg-white hover:bg-emerald-50/50 border border-dashed border-emerald-600/40 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add More Services</span>
            </button>

            {/* Who is this visit for? */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Who is this visit for?</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Patient Details</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBeneficiary('myself')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    beneficiary === 'myself'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Myself</span>
                    {beneficiary === 'myself' && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {patientUser.name || 'Account Holder'} ({patientUser.age || 35} Yrs)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBeneficiary('family')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    beneficiary === 'family'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Parent / Family</span>
                    {beneficiary === 'family' && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    Book for Parents, Kids, Spouse
                  </p>
                </button>
              </div>

              {beneficiary === 'family' && (
                <div className="pt-2 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10.5px] font-bold text-slate-700">Relationship:</span>
                    {(['Mother', 'Father', 'Spouse', 'Child', 'Other'] as const).map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setFamilyRelation(rel)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          familyRelation === rel
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        value={familyPatientName}
                        onChange={(e) => setFamilyPatientName(e.target.value)}
                        placeholder={`e.g. ${familyRelation === 'Mother' ? 'Sunita Sharma' : 'Suresh Sharma'}`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={familyPatientAge}
                          onChange={(e) => setFamilyPatientAge(e.target.value)}
                          placeholder="68"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={familyPatientGender}
                          onChange={(e) => setFamilyPatientGender(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prescription (Rx) Readiness */}
            {hasRxRequirement && (
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        Prescription (Rx) &amp; Medicine Check
                      </h4>
                      <p className="text-[9.5px] text-slate-500">
                        Clinical safety compliance for injections &amp; procedures
                      </p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Rx Required
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold text-slate-700">
                      Upload Doctor's Prescription:
                    </span>
                    {uploadedRxFileName ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Attached</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Optional</span>
                    )}
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                  />

                  {uploadedRxFileName ? (
                    <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-bold text-emerald-950 truncate max-w-[200px]">
                          {uploadedRxFileName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedRxFileName(null)}
                        className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulateRxUpload}
                        className="py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Attach sample signed Rx"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Quick Sample</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label 
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isRxConfirmed 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isRxConfirmed}
                      onChange={(e) => setIsRxConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-700 accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10.5px] leading-tight text-slate-700">
                      <span className="font-bold text-slate-900 block">
                        I have a valid doctor's prescription &amp; prescribed medicine ready at home.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Care Specialist & Paramedic Selection (Auto-assign vs Patient Choice) */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      Care Specialist &amp; Paramedic
                    </h4>
                    <p className="text-[9.5px] text-slate-500">
                      Choose auto-assignment or select preferred practitioner
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-extrabold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {careAssignmentMode === 'auto' ? 'Auto-Dispatch' : 'Patient Pick'}
                </span>
              </div>

              {/* Mode Toggle Pills */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCareAssignmentMode('auto')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    careAssignmentMode === 'auto'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Auto-Assign</span>
                    </span>
                    {careAssignmentMode === 'auto' && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    Fastest dispatch (15-20 min). Automatically routes to closest available DB nurse.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCareAssignmentMode('manual')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    careAssignmentMode === 'manual'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Choose Nurse</span>
                    </span>
                    {careAssignmentMode === 'manual' && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    Pick your preferred verified nurse from the database list.
                  </p>
                </button>
              </div>

              {/* Patient Selection of Available Nurses from DB */}
              {careAssignmentMode === 'manual' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Available In Database ({providers.filter(p => p.isAvailable !== false).length})
                    </span>
                    <span className="text-[9.5px] font-semibold text-emerald-700">
                      Live Verified Standby
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                    {providers
                      .filter(p => p.isAvailable !== false)
                      .map((nurse) => {
                        const isSelected = selectedNurseId === nurse.id;
                        return (
                          <div
                            key={nurse.id}
                            onClick={() => setSelectedNurseId(nurse.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 shadow-2xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={nurse.avatar || '/assets/ui/hero_doctor.png'}
                                alt={nurse.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-xs font-bold text-slate-900 truncate">
                                    {nurse.name}
                                  </h5>
                                  <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                    Verified ✓
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 truncate font-medium">
                                  {nurse.title || 'Registered Nurse (RN)'}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 text-[9.5px]">
                                  <span className="flex items-center gap-0.5 font-bold text-amber-500">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    <span>{nurse.rating || 4.9}</span>
                                  </span>
                                  <span className="text-slate-400">({nurse.reviewCount || 100}+ visits)</span>
                                  <span className="text-emerald-700 font-bold">• {nurse.etaMinutes || 18}m away</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                isSelected ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Bill Summary Breakdown matching Screenshot 4 */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>Sub Total</span>
                <span className="font-bold text-slate-900">₹{subTotal}</span>
              </div>

              {totalPackSavings > 0 && (
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                  <span>Multi-Visit Savings</span>
                  <span>-₹{totalPackSavings}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span className="flex items-center gap-1">
                  <span>Convenience Fee</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
                <span className="font-bold text-slate-900">₹{convenienceFee}</span>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between font-extrabold text-slate-900">
                <span className="text-xs">Total Amount</span>
                <span className="text-sm font-black text-emerald-950">₹{totalAmount}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Bar matching Screenshot 4 (`ADD | ₹1,027 >` / `BOOK VISIT | ₹1,027 >`) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-3.5 py-2.5 shadow-xl select-none">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider block">
                  Delivering to {activeAddressLabel}
                </span>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[240px]">
                  {activeAddressText}
                </p>
              </div>
            </div>
            <button
              onClick={onAddressClick}
              className="text-[10.5px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
            >
              Change
            </button>
          </div>

          {isVisitActive ? (
            <button
              type="button"
              onClick={() => {
                showToast('Active Visit In Progress', 'You cannot book a new visit until your current visit is completed or cancelled.', 'warning');
                onTabChange?.('orders');
              }}
              className="w-full bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-between transition-all cursor-pointer border border-amber-600"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="text-[11px] uppercase tracking-wider font-extrabold">Booking Locked (Active Visit In Progress)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-200 stroke-[2.5] shrink-0" />
            </button>
          ) : (
            <button
              onClick={handleProceed}
              className="w-full bg-[#084d3e] hover:bg-[#063f33] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold">BOOK VISIT</span>
                <span className="text-emerald-300/60">|</span>
                <span className="text-sm font-black text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
