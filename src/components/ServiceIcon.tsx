import React from 'react';
import { 
  Syringe, 
  Pipette, 
  Bandage, 
  Cross, 
  Stethoscope, 
  Activity, 
  BriefcaseMedical, 
  Accessibility, 
  HeartHandshake, 
  TestTube, 
  FlaskConical, 
  Pill, 
  PlusCircle,
  LucideIcon
} from 'lucide-react';
import { ServiceCategory } from '../types/carex';

export interface ServiceIconProps {
  category?: ServiceCategory | string;
  subCategory?: string;
  serviceName?: string;
  serviceType?: string;
  iconName?: string;
  className?: string;
  size?: number;
}

/**
 * Centralized dynamic icon mapping helper utility.
 * Resolves standard Lucide icons based on category, service name, subcategory, or icon hint.
 *
 * Requirements:
 * - Injections & Infusions: Syringe / Pipette
 * - Wound Care & Dressing: Bandage
 * - Vital Signs & Checkups: Stethoscope / Activity
 * - Catheterization & Post-Surgical Nursing: BriefcaseMedical / Cross
 * - Physiotherapy & Mobility: Accessibility / Activity
 * - Elderly & Palliative Care: HeartHandshake
 * - Lab Sample Collection: TestTube / FlaskConical
 * - Fallback / General: Pill or PlusCircle
 */
export const getServiceIcon = (
  category?: ServiceCategory | string,
  serviceNameOrType?: string,
  iconName?: string
): LucideIcon => {
  const nameLower = (serviceNameOrType || '').toLowerCase();
  const catLower = (category || '').toLowerCase();
  const iconLower = (iconName || '').toLowerCase();

  // 1. Injections & Infusions: Syringe / Pipette
  if (
    iconLower.includes('pipette') || 
    nameLower.includes('dropper') || 
    nameLower.includes('pipette')
  ) {
    return Pipette;
  }

  if (
    iconLower.includes('syringe') || 
    catLower.includes('injection') ||
    catLower === 'injections_iv' ||
    nameLower.includes('injection') || 
    nameLower.includes('iv ') || 
    nameLower.includes('iv drip') || 
    nameLower.includes('infusion') || 
    nameLower.includes('drip') || 
    nameLower.includes('vaccin') || 
    nameLower.includes('im ') || 
    nameLower.includes('sc ') ||
    nameLower.includes('intramuscular') ||
    nameLower.includes('intravenous')
  ) {
    return Syringe;
  }

  // 2. Wound Care & Dressing: Bandage
  if (
    iconLower.includes('bandage') || 
    catLower === 'wound_dressing' ||
    nameLower.includes('wound') || 
    nameLower.includes('dressing') || 
    nameLower.includes('suture') || 
    nameLower.includes('bandage') || 
    nameLower.includes('burn') || 
    nameLower.includes('ulcer') ||
    nameLower.includes('debridement')
  ) {
    return Bandage;
  }

  // 3. Vital Signs & Checkups: Stethoscope / Activity
  if (
    iconLower.includes('activity') ||
    iconLower.includes('heartbeat') ||
    nameLower.includes('heartbeat') || 
    nameLower.includes('pulse') || 
    nameLower.includes('ecg') ||
    nameLower.includes('spo2') ||
    nameLower.includes('oximeter')
  ) {
    return Activity;
  }

  if (
    iconLower.includes('stethoscope') || 
    catLower === 'vitals_nursing' ||
    catLower === 'doctor' || 
    catLower === 'basic_nursing' ||
    nameLower.includes('vital') || 
    nameLower.includes('checkup') || 
    nameLower.includes('consult') || 
    nameLower.includes('doctor') || 
    nameLower.includes('bp ') ||
    nameLower.includes('blood pressure') ||
    nameLower.includes('examination')
  ) {
    return Stethoscope;
  }

  // 4. Catheterization & Post-Surgical Nursing: BriefcaseMedical / Cross
  if (
    iconLower.includes('cross') ||
    nameLower.includes('emergency kit') ||
    nameLower.includes('first aid')
  ) {
    return Cross;
  }

  if (
    iconLower.includes('briefcasemedical') || 
    nameLower.includes('catheter') || 
    nameLower.includes('foley') ||
    nameLower.includes('tube') || 
    nameLower.includes('stoma') || 
    nameLower.includes('ryles') || 
    nameLower.includes('post-op') || 
    nameLower.includes('post-surgical') ||
    nameLower.includes('tracheostomy') ||
    catLower === 'clinical_procedures' ||
    catLower === 'post_hospital_recovery'
  ) {
    return BriefcaseMedical;
  }

  // 5. Physiotherapy & Mobility: Accessibility / Activity
  if (
    iconLower.includes('accessibility') || 
    catLower === 'physiotherapy' || 
    catLower === 'rehab_support' ||
    nameLower.includes('physio') || 
    nameLower.includes('mobility') || 
    nameLower.includes('rehab') || 
    nameLower.includes('exercise') || 
    nameLower.includes('stroke') ||
    nameLower.includes('paralysis') ||
    nameLower.includes('gait') ||
    nameLower.includes('orthopedic')
  ) {
    return Accessibility;
  }

  // 6. Elderly & Palliative Care: HeartHandshake
  if (
    iconLower.includes('hearthandshake') || 
    catLower === 'elderly_care' || 
    catLower === 'equipment_mothercare' ||
    nameLower.includes('elderly') || 
    nameLower.includes('palliative') || 
    nameLower.includes('senior') || 
    nameLower.includes('companion') || 
    nameLower.includes('attendant') ||
    nameLower.includes('geriatric') ||
    nameLower.includes('bedside observation') ||
    nameLower.includes('hygiene support')
  ) {
    return HeartHandshake;
  }

  // 7. Lab Sample Collection: TestTube / FlaskConical
  if (
    iconLower.includes('flask') ||
    nameLower.includes('culture') ||
    nameLower.includes('saline') ||
    nameLower.includes('drip solution')
  ) {
    return FlaskConical;
  }

  if (
    iconLower.includes('testtube') || 
    catLower === 'lab_tests' ||
    catLower === 'diagnostics' || 
    catLower === 'diagnostic_assistance' ||
    nameLower.includes('blood') || 
    nameLower.includes('lab') || 
    nameLower.includes('test') || 
    nameLower.includes('sample') || 
    nameLower.includes('diagnostic') || 
    nameLower.includes('swab') ||
    nameLower.includes('cbc') ||
    nameLower.includes('sugar') ||
    nameLower.includes('lipid') ||
    nameLower.includes('phlebotomy')
  ) {
    return TestTube;
  }

  // Fallback: Pill or PlusCircle
  if (nameLower.includes('pill') || nameLower.includes('medication') || nameLower.includes('pharmacy')) {
    return Pill;
  }

  return PlusCircle;
};

// Backward-compatible alias
export const getServiceIconComponent = getServiceIcon;

/**
 * ServiceIcon Component
 * Renders dynamic service icons beside titles across cards, search, checkout, receipts, and dispatches.
 */
export const ServiceIcon: React.FC<ServiceIconProps> = ({
  category,
  subCategory,
  serviceName,
  serviceType,
  iconName,
  className = "w-4 h-4 text-teal-600",
  size
}) => {
  const IconComp = getServiceIcon(category, serviceName || subCategory || serviceType, iconName);
  return <IconComp className={className} size={size} />;
};

export default ServiceIcon;
