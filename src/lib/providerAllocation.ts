import { ServiceItem, HealthcareProvider, ServiceCategory } from '../types/carex';

/**
 * Maps a service category or service ID to required clinical skills/qualifications.
 */
export function mapCategoryToRequiredSkills(category: ServiceCategory | string): string[] {
  switch (category) {
    case 'basic_nursing':
      return ['Basic Nursing', 'Vital Signs Monitoring', 'Hygiene & Care'];
    case 'clinical_procedures':
      return ['IV Drip Setup', 'Catheter Care', 'Injection Admin', 'Clinical Procedures'];
    case 'post_hospital_recovery':
      return ['Post-OP Care', 'Wound Dressing', 'Sterile Procedures', 'Pain Management'];
    case 'elderly_care':
      return ['Elderly Care', 'Mobility Support', 'Bedside Observation'];
    case 'rehab_support':
      return ['Physiotherapy', 'Rehab Exercises', 'Stroke Recovery'];
    case 'diagnostic_assistance':
      return ['Phlebotomy', 'Blood Sample Collection', 'ECG Operation'];
    case 'emergency_support':
      return ['BLS / CPR Certification', 'Emergency Triage', 'Doctor Escalation'];
    case 'nursing':
      return ['Basic Nursing', 'Patient Monitoring'];
    case 'doctor':
      return ['General Medicine', 'Diagnosis & Triage', 'Prescription Writing'];
    case 'physiotherapy':
      return ['Physiotherapy', 'Rehab Support', 'Joint Mobilization'];
    case 'diagnostics':
      return ['Phlebotomy', 'Lab Tech Certification', 'Sample Transport'];
    default:
      return ['Certified Healthcare Practitioner'];
  }
}

/**
 * Filters and returns eligible providers that strictly match the required skills for a specific service.
 * @param service The target healthcare service item
 * @param providers Array of candidate healthcare providers
 */
export function getEligibleProviders(
  service: ServiceItem,
  providers: HealthcareProvider[]
): HealthcareProvider[] {
  if (!service) return providers;

  const reqSkills = service.requiredSkills && service.requiredSkills.length > 0
    ? service.requiredSkills
    : mapCategoryToRequiredSkills(service.category);

  return providers.filter(prov => {
    if (!prov.isAvailable) return false;
    
    const provSkills = [
      ...(prov.badges || []), 
      prov.title, 
      prov.bio || ''
    ];
    
    // Check if provider title, badges, or skills match the required service skills
    return reqSkills.some(req => 
      provSkills.some(s => s.toLowerCase().includes(req.toLowerCase())) ||
      prov.title.toLowerCase().includes(service.category.replace(/_/g, ' ')) ||
      prov.badges.some(b => b.toLowerCase().includes(req.toLowerCase()))
    );
  });
}

/**
 * Filters and returns "Universal / Combined" providers that possess matching skills for ALL selected services.
 * @param services Array of selected healthcare service items
 * @param providers Array of candidate healthcare providers
 */
export function getUniversalProviders(
  services: ServiceItem[],
  providers: HealthcareProvider[]
): HealthcareProvider[] {
  if (!services || services.length === 0) return [];
  
  return providers.filter(prov => {
    if (!prov.isAvailable) return false;
    
    // Provider must be eligible for EVERY service in the multi-service cart
    return services.every(srv => {
      const eligible = getEligibleProviders(srv, [prov]);
      return eligible.length > 0;
    });
  });
}

export interface AllocationEvaluationResult {
  scenario: 'single' | 'split' | 'no_match';
  universalProviders: HealthcareProvider[];
  perServiceAssignments: Record<string, HealthcareProvider | null>;
  missingServiceIds: string[];
  totalDurationMins: number;
}

/**
 * Evaluates real-time skill matching across all services in the cart.
 * Scenario A ('single'): At least 1 provider possesses skills for ALL cart services.
 * Scenario B ('split'): No single provider has all skills, but individual providers match each service.
 * Scenario C ('no_match'): One or more services have 0 available qualified providers.
 */
export function evaluateCartAllocation(
  cartServices: ServiceItem[],
  providers: HealthcareProvider[]
): AllocationEvaluationResult {
  const totalDurationMins = cartServices.reduce((sum, s) => {
    const mins = parseInt(s.duration?.replace(/\D/g, '') || '30', 10);
    return sum + (isNaN(mins) ? 30 : mins);
  }, 0);

  if (cartServices.length === 0) {
    return {
      scenario: 'single',
      universalProviders: [],
      perServiceAssignments: {},
      missingServiceIds: [],
      totalDurationMins: 0
    };
  }

  const universalProviders = getUniversalProviders(cartServices, providers);
  const perServiceAssignments: Record<string, HealthcareProvider | null> = {};
  const missingServiceIds: string[] = [];

  cartServices.forEach(srv => {
    const eligible = getEligibleProviders(srv, providers);
    if (eligible.length > 0) {
      perServiceAssignments[srv.id] = eligible[0];
    } else {
      perServiceAssignments[srv.id] = null;
      missingServiceIds.push(srv.id);
    }
  });

  let scenario: 'single' | 'split' | 'no_match' = 'single';
  if (missingServiceIds.length > 0) {
    scenario = 'no_match';
  } else if (universalProviders.length === 0) {
    scenario = 'split';
  }

  return {
    scenario,
    universalProviders,
    perServiceAssignments,
    missingServiceIds,
    totalDurationMins
  };
}
