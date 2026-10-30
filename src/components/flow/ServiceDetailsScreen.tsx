import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Share2, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Check, 
  Plus, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Stethoscope,
  HeartPulse,
  Syringe,
  PackageCheck,
  Building2,
  Users
} from 'lucide-react';
import { FlowServiceItem } from '../../types/flowTypes';
import { HeaderBar } from './HeaderBar';

interface ServiceDetailsScreenProps {
  service: FlowServiceItem;
  onBack: () => void;
  onAddToCart: (service: FlowServiceItem) => void;
  onGoToCart: () => void;
  isInCart: boolean;
  deliveryAddress?: string;
  onAddressClick?: () => void;
  onCallSupportClick?: () => void;
}

export const ServiceDetailsScreen: React.FC<ServiceDetailsScreenProps> = ({
  service,
  onBack,
  onAddToCart,
  onGoToCart,
  isInCart,
  deliveryAddress,
  onAddressClick,
  onCallSupportClick
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [addedJustNow, setAddedJustNow] = useState(false);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleAddClick = () => {
    onAddToCart(service);
    setAddedJustNow(true);
    setTimeout(() => setAddedJustNow(false), 2000);
  };

  const isRxRequired = 
    service.category === 'injections' || 
    service.id.includes('inj') || 
    service.id.includes('iv') || 
    service.id.includes('wound') ||
    service.title.toLowerCase().includes('injection') ||
    service.title.toLowerCase().includes('drip') ||
    service.title.toLowerCase().includes('suture');

  // Dynamic clinical procedure steps tailored to category
  const procedureSteps = (() => {
    switch (service.category) {
      case 'injections':
        return [
          { step: '1', title: 'Prescription & Drug Verification', desc: 'Nurse checks physician Rx, drug expiration, dosage, and patient allergy history.' },
          { step: '2', title: 'Vitals & Pre-Assessment', desc: 'Pre-injection blood pressure, pulse, and temperature checks recorded in digital log.' },
          { step: '3', title: 'Aseptic Site Prep', desc: 'Alcohol swab sterilization of deltoid or gluteal site using single-touch technique.' },
          { step: '4', title: 'Painless Gentle Administration', desc: 'Single-use auto-disable sterile syringe administration with minimum tissue disruption.' },
          { step: '5', title: '15-Minute Observation & Biohazard Disposal', desc: 'Monitoring for hypersensitivity reactions; safe sharps disposal in puncture-proof container.' }
        ];
      case 'wound':
        return [
          { step: '1', title: 'Wound Bed Assessment', desc: 'Clinical inspection of wound margins, depth, exudate, and healing progress.' },
          { step: '2', title: 'Sterile Saline Irrigation', desc: 'Gentle cleansing with warm sterile normal saline to remove cellular debris without trauma.' },
          { step: '3', title: 'Aseptic Suture / Debridement', desc: 'Hospital-grade autoclaved forceps and surgical stitch cutters used under sterile field.' },
          { step: '4', title: 'Antiseptic Barrier Dressing', desc: 'Application of non-adherent sterile dressing, hydrocolloid or silver sulfadiazine as ordered.' },
          { step: '5', title: 'Post-Care Advisory', desc: 'Detailed dressing change timetable and signs of infection explained to caregiver.' }
        ];
      case 'vitals':
        return [
          { step: '1', title: 'Patient Resting Equilibrium', desc: 'Patient sits or rests quietly for 5 minutes prior to baseline measurements.' },
          { step: '2', title: 'Digital & Manual Dual BP', desc: 'Hospital-calibrated sphygmomanometer check for accurate systolic and diastolic readings.' },
          { step: '3', title: 'Pulse Oximetry & Respiratory Rate', desc: 'Continuous SpO2 measurement with fingertip probe and subtle respiratory count.' },
          { step: '4', title: 'Blood Glucose & Temperature', desc: 'Sterile capillary blood glucose check and infrared tympanic thermometry.' },
          { step: '5', title: 'Digital Summary & Trend Sync', desc: 'Instant transmission of vitals to Map2Medic patient records and supervising doctor.' }
        ];
      case 'lab':
        return [
          { step: '1', title: 'Test Order & Fasting Check', desc: 'Phlebotomist verifies fasting requirements and barcoded sample collection kit.' },
          { step: '2', title: 'Vein Selection & Tourniquet', desc: 'Palpation of median cubital vein; tourniquet applied for under 60 seconds.' },
          { step: '3', title: 'Sterile Vacuum Phlebotomy', desc: 'Closed vacuum tube blood draw using sterile butterfly needle with flash visualization.' },
          { step: '4', title: 'Barcoding & Cold-Chain Storage', desc: 'Immediate barcode labeling in front of patient; stored in temperature-controlled cooler.' },
          { step: '5', title: 'Digital Diagnostic Report', desc: 'Sample dispatched to NABL accredited lab; official PDF reports available within 6 hours.' }
        ];
      case 'physio':
        return [
          { step: '1', title: 'Musculoskeletal Assessment', desc: 'Range of motion, joint laxity, muscle strength, and pain index evaluation.' },
          { step: '2', title: 'Therapeutic Warmup', desc: 'Gentle passive joint mobilization and muscle tone activation exercises.' },
          { step: '3', title: 'Targeted Clinical Rehab', desc: 'Tailored resistance exercises, gait re-training, or post-surgical mobilization.' },
          { step: '4', title: 'Electrotherapy / Pain Relief', desc: 'Portable TENS / IFT application for acute inflammation or muscle spasm relief.' },
          { step: '5', title: 'Home Exercise Protocol', desc: 'Structured exercise chart assigned for daily repetition between clinical sessions.' }
        ];
      default:
        return [
          { step: '1', title: 'Arrival & Hand Sanitization', desc: 'Clinical nurse sanitizes hands and dons disposable apron, mask, and sterile gloves.' },
          { step: '2', title: 'Health & Comfort Review', desc: 'Review of current patient status, comfort level, and primary clinical objectives.' },
          { step: '3', title: 'Procedure Execution', desc: 'Delivery of scheduled care according to hospital-grade standard operating procedures.' },
          { step: '4', title: 'Comfort & Position Check', desc: 'Ensuring patient is comfortable, hydrated, and seated or lying in safe posture.' },
          { step: '5', title: 'Documentation & Care Log', desc: 'Detailed notes logged on Map2Medic portal for family and physician review.' }
        ];
    }
  })();

  const kitInclusions = [
    'Single-use sealed medical sterile pack (opened right in front of you)',
    'Medical-grade nitrile gloves & surgical mask',
    'Antiseptic chlorhexidine / isopropyl alcohol prep wipes',
    'Sterile gauze swabs & hypoallergenic microporous tape',
    'CE-certified digital diagnostic instruments (calibrated weekly)',
    'Yellow puncture-resistant biohazard disposal container'
  ];

  const safetyGuidelines = [
    'Have your valid doctor prescription (if applicable) and medications ready before arrival.',
    'Inform the visiting specialist about known drug allergies (e.g., penicillin, sulfa) upon arrival.',
    'Keep the patient relaxed in a well-lit, clean, and ventilated room.',
    'A family member or adult attendant is encouraged to be present during the procedure.'
  ];

  const faqs = [
    {
      q: 'Do I need to purchase syringes or needles beforehand?',
      a: 'No. Our registered nurse arrives with a sealed 100% hospital-grade sterile kit containing syringes, needles, antiseptic swabs, and dressings. You only need to have the prescribed medicine/ampoule ready at home.'
    },
    {
      q: 'How are Map2Medic care specialists verified?',
      a: 'All practitioners undergo a 5-tier verification process: State Nursing Council license validation, criminal background verification, hospital experience check (min 3+ years), and aseptic protocol certification.'
    },
    {
      q: 'What if I need to reschedule or cancel?',
      a: 'You can reschedule or cancel directly from your Orders tab at zero cancellation fee before the specialist is en route.'
    },
    {
      q: 'Can the nurse assist with other quick checks during this visit?',
      a: 'Yes! Every visit includes a complimentary digital vitals screening (blood pressure, pulse, SpO2) at no extra charge.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] text-slate-800 text-left min-h-screen">
      {/* Top Header */}
      <HeaderBar 
        currentAddress={deliveryAddress}
        onAddressClick={onAddressClick}
        onCallSupportClick={onCallSupportClick}
      />

      {/* Navigation Sub-Bar */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between sticky top-[48px] z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center transition-all">
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>Back to Services</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {service.category.toUpperCase()}
          </span>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${service.title} - Map2Medic`,
                  text: `Book ${service.title} at home in 15-30 mins via Map2Medic.`,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
            title="Share Service"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 pb-24 scrollbar-thin">
        {/* Service Hero Card */}
        <div className="bg-gradient-to-br from-[#073b34] via-[#052e28] to-[#041f1b] rounded-2xl text-white p-5 shadow-lg border border-teal-800 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
                {service.category === 'injections' && <Syringe className="w-6 h-6" />}
                {service.category === 'wound' && <ShieldCheck className="w-6 h-6" />}
                {service.category === 'vitals' && <HeartPulse className="w-6 h-6" />}
                {service.category === 'lab' && <Stethoscope className="w-6 h-6" />}
                {service.category === 'physio' && <Award className="w-6 h-6" />}
                {service.category === 'elder' && <Users className="w-6 h-6" />}
              </div>

              <div className="text-right">
                <div className="text-2xl font-black tracking-tight text-white">
                  ₹{service.price}
                </div>
                <span className="text-[10px] text-teal-200 font-medium">per {service.unit}</span>
              </div>
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                {service.title}
              </h1>
              <p className="text-xs text-teal-100/90 font-medium mt-0.5">
                {service.subtitle}
              </p>
            </div>

            {/* Key Service Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10.5px] font-semibold text-emerald-200 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{service.duration || '20–30 mins'}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10.5px] font-semibold text-emerald-200 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Sterile Kit</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10.5px] font-semibold text-emerald-200 border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Doorstep Visit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Requirement Notice */}
        <div className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-2xs ${
          isRxRequired 
            ? 'bg-amber-50/80 border-amber-200/90 text-amber-950' 
            : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950'
        }`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isRxRequired ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold leading-tight">
              {isRxRequired ? 'Doctor’s Prescription (Rx) Required' : 'No Prescription Required'}
            </h4>
            <p className="text-[10px] mt-0.5 leading-relaxed opacity-90">
              {isRxRequired
                ? 'Under clinical safety standards, this medical procedure requires a valid doctor’s prescription. You can upload it during checkout or show it to the nurse upon doorstep arrival.'
                : 'This screening procedure can be booked directly for immediate routine home checkup without needing a doctor prescription.'}
            </p>
          </div>
        </div>

        {/* Clinical Overview / Description */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Clinical Description</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {service.description || 'Specialized clinical home care service administered by verified state-registered nurses using hospital-standard aseptic protocols and disposable kits.'}
          </p>
        </div>

        {/* Step-by-Step Clinical Procedure */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Clinical Protocol &amp; Procedure</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Strict adherence to aseptic standards ensures zero risk of cross-contamination:
          </p>

          <div className="space-y-3 pt-1">
            {procedureSteps.map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-300">
                  {s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {s.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's Included in the Sterile Visit Kit */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>What's Included in the Visit Kit</span>
          </h3>
          <ul className="space-y-2 pt-0.5">
            {kitInclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Patient Safety & Preparation Guidelines */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Patient Safety &amp; Preparation</span>
          </h3>
          <ul className="space-y-2 pt-0.5">
            {safetyGuidelines.map((guideline, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinical FAQs Accordion */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-2.5 first:pt-1 last:pb-1">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between gap-3 text-left group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 pl-0.5">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-3.5 py-2.5 shadow-xl select-none">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Service Price
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-slate-900">₹{service.price}</span>
              <span className="text-[10px] text-slate-500 font-medium">/{service.unit}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-2">
            {isInCart ? (
              <button
                onClick={onGoToCart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="text-xs uppercase tracking-wider font-extrabold">In Cart • View Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAddClick}
                className="flex-1 bg-[#084d3e] hover:bg-[#063f33] active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="text-xs uppercase tracking-wider font-extrabold">
                  {addedJustNow ? 'Added to Cart ✓' : '+ Add Service to Visit'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
