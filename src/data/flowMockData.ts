import { FlowCartItem, FlowServiceItem, FlowSpecialist, FlowServiceProgressItem } from '../types/flowTypes';

export const POPULAR_CATEGORIES = [
  { id: 'injections', name: 'Injections', icon: 'syringe', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'wound', name: 'Wound Care', icon: 'bandage', color: 'bg-amber-50 text-amber-700' },
  { id: 'vitals', name: 'Vitals', icon: 'activity', color: 'bg-blue-50 text-blue-700' },
  { id: 'lab', name: 'Lab Tests', icon: 'flask-conical', color: 'bg-cyan-50 text-cyan-700' },
  { id: 'physio', name: 'Physio', icon: 'stretching', color: 'bg-teal-50 text-teal-700' },
  { id: 'elder', name: 'Elder Care', icon: 'heart-handshake', color: 'bg-indigo-50 text-indigo-700' },
];

export const INJECTION_SERVICES: FlowServiceItem[] = [
  {
    id: 'srv-inj-admin',
    title: 'Injection Administration',
    subtitle: 'One-time • At Home',
    price: 99,
    unit: 'injection',
    category: 'injections',
    imageType: 'injection',
    duration: '20 mins',
    description: 'Sterile subcutaneous or intramuscular injection with disposable kit by verified registered nurse.'
  },
  {
    id: 'srv-iv-drip',
    title: 'IV Drip Setup',
    subtitle: 'Hospital-grade care',
    price: 199,
    unit: 'visit',
    category: 'injections',
    imageType: 'iv-drip',
    duration: '45 mins',
    description: 'Hospital-grade IV cannulation, infusion set, and vitals monitoring during the session.'
  },
  {
    id: 'srv-vaccination',
    title: 'Vaccination',
    subtitle: 'Child & Adult',
    price: 149,
    unit: 'dose',
    category: 'injections',
    imageType: 'vaccine',
    duration: '25 mins',
    description: 'Certified nurse cold-chain vaccine administration with post-vaccination observation.'
  },
  {
    id: 'srv-im-sc',
    title: 'IM / SC Injection',
    subtitle: 'One-time • At Home',
    price: 99,
    unit: 'injection',
    category: 'injections',
    imageType: 'im-injection',
    duration: '20 mins',
    description: 'Intramuscular or subcutaneous injection with doctor prescription verification and vitals check.'
  }
];

export const ALL_SERVICES_CATALOG: FlowServiceItem[] = [
  ...INJECTION_SERVICES,
  // Wound Care
  {
    id: 'srv-wound-dressing',
    title: 'Suture Removal & Dressing',
    subtitle: 'Hospital-grade sterile care',
    price: 149,
    unit: 'session',
    category: 'wound',
    imageType: 'wound',
    duration: '30 mins',
    description: 'Aseptic suture removal, antiseptic cleansing, and sterile protective dressing.'
  },
  {
    id: 'srv-bed-sore',
    title: 'Bed Sore Debridement',
    subtitle: 'Ulcer staging & hydrocolloid dressing',
    price: 249,
    unit: 'session',
    category: 'wound',
    imageType: 'wound',
    duration: '45 mins',
    description: 'Specialist pressure ulcer debridement, cleaning, and barrier hydrocolloid dressing.'
  },
  // Vitals
  {
    id: 'srv-vitals-check',
    title: 'Comprehensive Vitals & ECG',
    subtitle: '12-Lead Portable ECG + Vitals',
    price: 299,
    unit: 'visit',
    category: 'vitals',
    imageType: 'vitals',
    duration: '30 mins',
    description: 'Full vital sign screening: blood pressure, SpO2, heart rate, blood sugar, and 12-lead ECG.'
  },
  {
    id: 'srv-catheter-care',
    title: 'Foley Catheter Care & Flush',
    subtitle: 'Sterile catheterization',
    price: 199,
    unit: 'session',
    category: 'vitals',
    imageType: 'vitals',
    duration: '35 mins',
    description: 'Sterile Foley catheter insertion, irrigation flush, and urine drainage bag replacement.'
  },
  // Lab Tests
  {
    id: 'lab-blood',
    title: 'Lab Test (Blood)',
    subtitle: 'Basic Health Panel',
    price: 499,
    unit: 'test',
    category: 'lab',
    imageType: 'blood-test',
    duration: '15 mins',
    description: 'Phlebotomist doorstep blood draw for 12 key biomarkers. Digital report within 6 hours.'
  },
  {
    id: 'srv-cbc-panel',
    title: 'Complete Blood Count (CBC)',
    subtitle: 'NABL Certified Diagnostic',
    price: 199,
    unit: 'test',
    category: 'lab',
    imageType: 'blood-test',
    duration: '15 mins',
    description: 'Hemoglobin, RBC, WBC, platelet count with barcoded vacuum tube sampling.'
  },
  // Physio
  {
    id: 'physio-sesh',
    title: 'Physio Session',
    subtitle: 'Home Visit',
    price: 399,
    unit: 'session',
    category: 'physio',
    imageType: 'physio',
    duration: '45 mins',
    description: 'Hands-on clinical physiotherapy: joint mobilization, electrotherapy TENS, and posture rehab.'
  },
  {
    id: 'srv-ortho-rehab',
    title: 'Orthopedic Post-Op Rehab',
    subtitle: 'Knee & Hip Mobilization',
    price: 499,
    unit: 'session',
    category: 'physio',
    imageType: 'physio',
    duration: '60 mins',
    description: 'Targeted post-operative physical rehab for knee replacement and spinal alignment.'
  },
  // Elder Care
  {
    id: 'srv-elder-bedside',
    title: 'Elder Care Bedside Sitting',
    subtitle: 'Compassionate assistance',
    price: 499,
    unit: 'visit',
    category: 'elder',
    imageType: 'elder',
    duration: '4 hrs',
    description: 'Dedicated nursing assistant bedside sitting, medication reminders, and mobility support.'
  },
  {
    id: 'srv-elder-hygiene',
    title: 'Bedside Hygiene & Sponge Bath',
    subtitle: 'Dignified personal care',
    price: 299,
    unit: 'session',
    category: 'elder',
    imageType: 'elder',
    duration: '45 mins',
    description: 'Gentle bed bath, oral hygiene, pressure sore check, and linen change.'
  }
];

export const INITIAL_CART_ITEMS: FlowCartItem[] = [
  {
    service: {
      id: 'srv-inj-admin',
      title: 'Injection Administration',
      subtitle: 'One-time • At Home',
      price: 99,
      unit: 'injection',
      category: 'injections',
      imageType: 'injection',
      duration: '20 mins',
      description: 'Sterile subcutaneous or intramuscular injection by registered nurse.'
    },
    quantity: 1
  },
  {
    service: {
      id: 'lab-blood',
      title: 'Lab Test (Blood)',
      subtitle: 'Basic Health Panel',
      price: 499,
      unit: 'test',
      category: 'lab',
      imageType: 'blood-test',
      duration: '15 mins',
      description: 'Phlebotomist doorstep blood draw for 12 key biomarkers.'
    },
    quantity: 1
  },
  {
    service: {
      id: 'physio-sesh',
      title: 'Physio Session',
      subtitle: 'Home Visit',
      price: 399,
      unit: 'session',
      category: 'physio',
      imageType: 'physio',
      duration: '45 mins',
      description: 'Hands-on clinical physiotherapy and mobility rehab.'
    },
    quantity: 1
  }
];

export const ASSIGNED_SPECIALIST: FlowSpecialist = {
  name: 'Priya Nair',
  role: 'Senior Registered Nurse (RN)',
  rating: 4.95,
  reviewCount: 188,
  experience: '7+ years',
  phone: '+91 98102 34567',
  avatarUrl: 'https://images.unsplash.com/photo-1594824813587-6e6955745129?auto=format&fit=crop&q=80&w=256',
  vehicle: 'Hero Electric Optima (Green)',
  plateNumber: 'HR-26-EM-4821',
  distance: '1.2 km away',
  etaMinutes: 18
};

export const INITIAL_SERVICE_PROGRESS: FlowServiceProgressItem[] = [
  {
    id: 'sp-1',
    title: 'Injection Administration',
    category: 'injections',
    status: 'in_progress',
    timeEstimate: 'Started 3 mins ago'
  },
  {
    id: 'sp-2',
    title: 'Lab Test (Blood)',
    category: 'lab',
    status: 'pending',
    timeEstimate: 'Next in sequence'
  },
  {
    id: 'sp-3',
    title: 'Physio Session',
    category: 'physio',
    status: 'pending',
    timeEstimate: 'Awaiting completion of vitals'
  }
];

export const MATCHING_CRITERIA = [
  {
    id: 'skills',
    title: 'Skills & Expertise',
    desc: 'Matching certified nursing & phlebotomy specialists',
    icon: 'badge-check'
  },
  {
    id: 'service',
    title: 'Service Ability',
    desc: 'Verifying equipment & sterile kit capability',
    icon: 'stethoscope'
  },
  {
    id: 'distance',
    title: 'Distance',
    desc: 'Finding the nearest available care specialists in DLF 3',
    icon: 'map-pin'
  },
  {
    id: 'availability',
    title: 'Availability',
    desc: 'Confirming instant slot confirmation & on-time arrival',
    icon: 'calendar-clock'
  }
];

export const ADDRESSES = [
  { id: 'home', label: 'HOME', address: 'B12 DLF Phase 3, Gurugram', isDefault: true },
  { id: 'work', label: 'WORK', address: 'Cyber City, Tower B, Gurugram', isDefault: false },
  { id: 'parents', label: "PARENTS' HOME", address: 'Sector 43, Golf Course Road, Gurugram', isDefault: false },
];
