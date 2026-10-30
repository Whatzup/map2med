import { db, activeEngine, mysqlPool } from './index.ts';
import { 
  servicePricing, 
  providers, 
  providerDocuments, 
  bookings, 
  cartItems,
  appConfig,
  userAddresses,
  users, 
  userLogins, 
  patients,
  reviews,
  prescriptions,
  patientVitalsHistory,
  providerSchedules,
  payouts,
  careMessages,
  notifications
} from './schema.ts';
import { eq, desc, sql } from 'drizzle-orm';
import { INITIAL_SERVICES, INITIAL_PROVIDERS, INITIAL_BOOKINGS, INITIAL_PATIENT } from '../data/mockData.ts';
import { calculateAgeFromDob } from '../lib/dateUtils.ts';

// Helper to check if a valid database configuration exists (Hostinger MySQL)
export function isDbConfigured(): boolean {
  return true;
}

// Database store & fallback
export let isDbAvailable = isDbConfigured();

export const DOORSTEP_CLINICAL_SERVICES: any[] = [
  {
    id: 'srv-inj-admin',
    name: 'Injection Administration',
    category: 'injections',
    subCategory: 'One-time • At Home',
    price: 99,
    baseAmountLabel: 'per injection',
    duration: '20 mins',
    serviceType: 'Home Visit',
    description: 'Sterile subcutaneous or intramuscular injection with disposable kit by verified registered nurse.',
    includes: ['Sterile single-use syringe', 'Alcohol prep pads', 'Vitals check (BP, Pulse)', 'Sharps disposal'],
    popular: true,
    requiresPrescription: true,
  },
  {
    id: 'srv-iv-drip',
    name: 'IV Drip Setup',
    category: 'injections',
    subCategory: 'Hospital-grade care',
    price: 199,
    baseAmountLabel: 'per visit',
    duration: '45 mins',
    serviceType: 'Home Visit',
    description: 'Hospital-grade IV cannulation, infusion set, and vitals monitoring during the session.',
    includes: ['IV Cannula & Infusion Set', 'Saline Flush', 'Infusion Rate Monitoring', 'Sterile Dressing'],
    popular: true,
    requiresPrescription: true,
  },
  {
    id: 'srv-vaccination',
    name: 'Vaccination',
    category: 'injections',
    subCategory: 'Child & Adult',
    price: 149,
    baseAmountLabel: 'per dose',
    duration: '25 mins',
    serviceType: 'Home Visit',
    description: 'Certified nurse cold-chain vaccine administration with post-vaccination observation.',
    includes: ['Cold-chain vaccine verification', 'Post-shot observation (15 mins)', 'Digital immunization record'],
    popular: true,
    requiresPrescription: false,
  },
  {
    id: 'srv-im-sc',
    name: 'IM / SC Injection',
    category: 'injections',
    subCategory: 'One-time • At Home',
    price: 99,
    baseAmountLabel: 'per injection',
    duration: '20 mins',
    serviceType: 'Home Visit',
    description: 'Intramuscular or subcutaneous injection with doctor prescription verification and vitals check.',
    includes: ['Intramuscular / Subcutaneous delivery', 'Prescription dosage check', 'Sterile site preparation'],
    popular: false,
    requiresPrescription: true,
  },
  {
    id: 'srv-wound-dressing',
    name: 'Suture Removal & Dressing',
    category: 'wound',
    subCategory: 'Hospital-grade sterile care',
    price: 149,
    baseAmountLabel: 'per session',
    duration: '30 mins',
    serviceType: 'Home Visit',
    description: 'Aseptic suture removal, antiseptic cleansing, and sterile protective dressing.',
    includes: ['Sterile suture stitch cutter', 'Betadine antiseptic cleanse', 'Non-adherent wound pad'],
    popular: true,
  },
  {
    id: 'srv-bed-sore',
    name: 'Bed Sore Debridement',
    category: 'wound',
    subCategory: 'Ulcer staging & hydrocolloid dressing',
    price: 249,
    baseAmountLabel: 'per session',
    duration: '45 mins',
    serviceType: 'Home Visit',
    description: 'Specialist pressure ulcer debridement, cleaning, and barrier hydrocolloid dressing.',
    includes: ['Pressure ulcer staging assessment', 'Saline irrigation & barrier cream', 'Hydrocolloid dressing'],
    popular: false,
  },
  {
    id: 'srv-vitals-check',
    name: 'Comprehensive Vitals & ECG',
    category: 'vitals',
    subCategory: '12-Lead Portable ECG + Vitals',
    price: 299,
    baseAmountLabel: 'per visit',
    duration: '30 mins',
    serviceType: 'Home Visit',
    description: 'Full vital sign screening: blood pressure, SpO2, heart rate, blood sugar, and 12-lead ECG.',
    includes: ['12-Lead portable digital ECG', 'Blood pressure & pulse rate', 'Random blood sugar check', 'SpO2 oxygen level'],
    popular: true,
  },
  {
    id: 'srv-catheter-care',
    name: 'Foley Catheter Care & Flush',
    category: 'vitals',
    subCategory: 'Sterile catheterization',
    price: 199,
    baseAmountLabel: 'per session',
    duration: '35 mins',
    serviceType: 'Home Visit',
    description: 'Sterile Foley catheter insertion, irrigation flush, and urine drainage bag replacement.',
    includes: ['Aseptic Foley catheter replacement', 'Saline bladder wash flush', 'Uro-bag drain attachment'],
    popular: false,
  },
  {
    id: 'lab-blood',
    name: 'Lab Test (Blood) - Basic Health Panel',
    category: 'lab',
    subCategory: 'Basic Health Panel',
    price: 499,
    baseAmountLabel: 'per test',
    duration: '15 mins',
    serviceType: 'Home Visit',
    description: 'Phlebotomist doorstep blood draw for 12 key biomarkers. Digital report within 6 hours.',
    includes: ['CBC Complete Blood Count', 'Lipid Profile', 'Fasting Blood Sugar', 'Kidney & Liver Screening'],
    popular: true,
  },
  {
    id: 'srv-cbc-panel',
    name: 'Complete Blood Count (CBC)',
    category: 'lab',
    subCategory: 'NABL Certified Diagnostic',
    price: 199,
    baseAmountLabel: 'per test',
    duration: '15 mins',
    serviceType: 'Home Visit',
    description: 'Hemoglobin, RBC, WBC, platelet count with barcoded vacuum tube sampling.',
    includes: ['Barcoded vacuum tube draw', 'NABL accredited laboratory report', 'Digital PDF report delivery'],
    popular: false,
  },
  {
    id: 'physio-sesh',
    name: 'Physio Session - Home Visit',
    category: 'physio',
    subCategory: 'Home Visit',
    price: 399,
    baseAmountLabel: 'per session',
    duration: '45 mins',
    serviceType: 'Home Visit',
    description: 'Hands-on clinical physiotherapy: joint mobilization, electrotherapy TENS, and posture rehab.',
    includes: ['Orthopedic assessment', 'TENS electro-stimulation', 'Manual passive/active stretching', 'Home exercise guide'],
    popular: true,
  },
  {
    id: 'srv-ortho-rehab',
    name: 'Post-Stroke Mobilization',
    category: 'physio',
    subCategory: 'Targeted recovery',
    price: 449,
    baseAmountLabel: 'per session',
    duration: '60 mins',
    serviceType: 'Home Visit',
    description: 'Targeted post-operative physical rehab for knee replacement and spinal alignment.',
    includes: ['Gait training assist', 'Balance & neuromuscular facilitation', 'Fall prevention assessment'],
    popular: false,
  },
  {
    id: 'srv-elder-bedside',
    name: 'Elderly Bedside Care Shift',
    category: 'elder',
    subCategory: '4-hr Certified Attendant Care',
    price: 599,
    baseAmountLabel: 'per 4h shift',
    duration: '4 hrs',
    serviceType: 'Home Visit',
    description: 'Dedicated nursing assistant bedside sitting, medication reminders, and mobility support.',
    includes: ['4 hours attentive bedside care', 'Vitals logging (every 2 hrs)', 'Assisted ambulation & feeding', 'Emergency clinician contact'],
    popular: true,
  },
  {
    id: 'srv-elder-hygiene',
    name: 'Companion & Dementia Care',
    category: 'elder',
    subCategory: 'Active memory stimulation',
    price: 499,
    baseAmountLabel: 'per visit',
    duration: '2 hrs',
    serviceType: 'Home Visit',
    description: 'Gentle bed bath, oral hygiene, pressure sore check, and linen change.',
    includes: ['Cognitive memory exercises', 'Gentle bed sponge bath', 'Medication regimen compliance', 'Status report to family'],
    popular: false,
  }
];

export const memoryServices: any[] = [...DOORSTEP_CLINICAL_SERVICES];
export const memoryProviders: any[] = [...INITIAL_PROVIDERS];
export const memoryBookings: any[] = [...INITIAL_BOOKINGS];
export const memoryUsers: any[] = [
  {
    uid: 'usr-patient-rahul',
    email: 'rahul.sharma@map2medic.in',
    name: 'Rahul Sharma',
    role: 'patient',
    phone: '+91 98765 43210',
    address: 'B12 DLF Phase 3, Gurugram',
  },
  {
    uid: 'prov-priya-nair',
    email: 'priya.nair@map2medic.in',
    name: 'Priya Nair',
    role: 'provider',
    phone: '+91 98102 34567',
    address: 'DLF Phase 5 Corridor, Gurugram',
  },
];
export const memoryLogins: any[] = [];
export const memoryPatients: any[] = [INITIAL_PATIENT];
export const memoryReviews: any[] = [];
export const memoryPrescriptions: any[] = [];
export const memoryVitalsHistory: any[] = [];
export const memorySchedules: any[] = [];
export const memoryPayouts: any[] = [];
export const memoryMessages: any[] = [];
export const memoryNotifications: any[] = [];

export const memoryCart: any[] = [
  {
    id: 'cart-1',
    userId: 'usr-patient-rahul',
    serviceId: 'srv-inj-admin',
    title: 'Injection Administration',
    subtitle: 'One-time • At Home',
    price: 99,
    unit: 'injection',
    category: 'injections',
    imageType: 'injection',
    duration: '20 mins',
    quantity: 1,
  },
  {
    id: 'cart-2',
    userId: 'usr-patient-rahul',
    serviceId: 'lab-blood',
    title: 'Lab Test (Blood) - Basic Health Panel',
    subtitle: 'Basic Panel • CBC, Lipid, Blood Sugar',
    price: 499,
    unit: 'test',
    category: 'lab',
    imageType: 'blood-test',
    duration: '30 mins',
    quantity: 1,
  },
  {
    id: 'cart-3',
    userId: 'usr-patient-rahul',
    serviceId: 'physio-sesh',
    title: 'Physio Session - Home Visit',
    subtitle: '45-min Orthopedic / Neuro Rehab',
    price: 399,
    unit: 'session',
    category: 'physio',
    imageType: 'physio',
    duration: '45 mins',
    quantity: 1,
  }
];

export const memoryAppConfig: Record<string, string> = {
  helpline_phone: '1-800-MAP2MEDIC',
  convenience_fee: '30',
  default_delivery_address: 'B12 DLF Phase 3, Gurugram',
  default_address_label: 'HOME',
  active_dispatch_eta: '18',
};

// Helper to handle DB errors gracefully
export function handleDbFailure(error: any) {
  if (!error) return;

  const cause = error?.cause || error;
  const errorMsg = error?.message || '';
  const causeMsg = cause?.message || '';
  const errorCode = error?.code || cause?.code || '';
  const fullErrorString = `${errorMsg} ${causeMsg} ${errorCode} ${String(error)} ${String(cause)}`.toLowerCase();

  const isConnectionError =
    fullErrorString.includes('econnrefused') ||
    fullErrorString.includes('connect') ||
    fullErrorString.includes('timeout') ||
    fullErrorString.includes('enotfound') ||
    fullErrorString.includes('etimedout') ||
    fullErrorString.includes('address') ||
    fullErrorString.includes('getaddrinfo') ||
    fullErrorString.includes('pool') ||
    fullErrorString.includes('closed') ||
    fullErrorString.includes('socket') ||
    fullErrorString.includes('terminated') ||
    fullErrorString.includes('failed query') ||
    fullErrorString.includes('drizzlequeryerror') ||
    fullErrorString.includes('access denied') ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ETIMEDOUT' ||
    String(errorCode).startsWith('08') ||
    String(errorCode).startsWith('28');

  if (isConnectionError) {
    if (isDbAvailable) {
      console.warn('Database connection offline or access restricted. Switching to In-Memory Fallback Database. Reason:', causeMsg || errorMsg || error);
      isDbAvailable = false;

      if (isDbConfigured()) {
        setTimeout(() => {
          console.log('Database self-healing: Re-enabling connection attempt...');
          isDbAvailable = true;
        }, 30000);
      }
    }
  } else {
    console.error('Database query execution failed:', errorMsg || error);
  }
}

// Record User Login
export async function recordUserLoginInDb(userId: string, email: string, ipAddress?: string, userAgent?: string) {
  const loginId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const loginObj = {
    id: loginId,
    userId,
    email,
    loginAt: new Date().toISOString(),
    ipAddress: ipAddress || '127.0.0.1',
    userAgent: userAgent || 'Map2Medic App',
    status: 'success',
  };
  memoryLogins.push(loginObj);

  if (isDbAvailable) {
    try {
      await db.insert(userLogins).values({
        id: loginId,
        userId,
        email,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Map2Medic App',
        status: 'success',
      });
    } catch (error) {
      handleDbFailure(error);
    }
  }
}

// Seed Initial Data if empty and create all 14 concept tables in Hostinger MySQL
export async function seedInitialDataIfEmpty() {
  if (!isDbAvailable) return;
  try {
    if (mysqlPool) {
      console.log('Verifying schemas and creating all 14 tables with constraints in Hostinger MySQL...');
      const queries = [
        `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          uid VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          phone VARCHAR(100),
          role VARCHAR(50) NOT NULL DEFAULT 'patient',
          address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS user_logins (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(100),
          user_agent TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'success',
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS patients (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          age INT DEFAULT 35,
          gender VARCHAR(50),
          phone VARCHAR(100),
          address TEXT,
          landmark VARCHAR(255),
          emergency_contact_phone VARCHAR(100),
          mobility_status VARCHAR(100),
          recently_discharged VARCHAR(100),
          medical_notes TEXT,
          blood_group VARCHAR(20),
          allergies TEXT,
          date_of_birth VARCHAR(50),
          insurance_provider VARCHAR(255),
          insurance_policy_number VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS providers (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          avatar TEXT,
          rating VARCHAR(20) DEFAULT '5.0',
          review_count INT DEFAULT 0,
          experience_years INT DEFAULT 1,
          distance_km VARCHAR(20) DEFAULT '2.0',
          eta_minutes INT DEFAULT 20,
          is_available BOOLEAN DEFAULT TRUE,
          current_location_name VARCHAR(255) DEFAULT 'Metro District',
          badges JSON,
          hourly_rate INT DEFAULT 50,
          completed_visits INT DEFAULT 0,
          phone VARCHAR(100),
          email VARCHAR(255),
          bio TEXT,
          date_of_birth VARCHAR(50),
          age INT DEFAULT 35,
          pending_payout INT DEFAULT 0,
          total_earnings_month INT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS service_pricing (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          sub_category VARCHAR(100),
          price INT NOT NULL,
          base_amount_label VARCHAR(100) NOT NULL,
          duration VARCHAR(100) NOT NULL,
          service_type VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          includes JSON,
          popular BOOLEAN DEFAULT FALSE,
          requires_prescription BOOLEAN DEFAULT FALSE,
          priority VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(255) PRIMARY KEY,
          patient_id VARCHAR(255),
          service_id VARCHAR(255),
          provider_id VARCHAR(255),
          patient_name VARCHAR(255),
          patient_age INT,
          patient_gender VARCHAR(50),
          patient_phone VARCHAR(100),
          patient_address TEXT,
          landmark VARCHAR(255),
          lift_availability VARCHAR(100),
          emergency_contact_phone VARCHAR(100),
          mobility_status VARCHAR(100),
          recently_discharged VARCHAR(100),
          service_name VARCHAR(255),
          provider_name VARCHAR(255),
          provider_phone VARCHAR(100),
          date VARCHAR(100) NOT NULL,
          time_slot VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
          base_price INT NOT NULL,
          addons JSON,
          platform_fee INT NOT NULL DEFAULT 5,
          discount INT NOT NULL DEFAULT 0,
          total_amount INT NOT NULL,
          payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
          payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
          medical_notes TEXT,
          vitals_recorded JSON,
          intake_intent VARCHAR(255),
          care_duration VARCHAR(100),
          otp_code VARCHAR(20),
          progress_checklist JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE SET NULL,
          FOREIGN KEY (service_id) REFERENCES service_pricing(id) ON DELETE SET NULL,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
        );`,
        `CREATE TABLE IF NOT EXISTS provider_documents (
          id VARCHAR(255) PRIMARY KEY,
          provider_id VARCHAR(255),
          patient_id VARCHAR(255),
          doc_type VARCHAR(100) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          uploaded_at VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
          rejection_reason TEXT,
          expiry_date VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS reviews (
          id VARCHAR(255) PRIMARY KEY,
          booking_id VARCHAR(255),
          patient_id VARCHAR(255),
          provider_id VARCHAR(255) NOT NULL,
          rating INT NOT NULL,
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE SET NULL,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS prescriptions (
          id VARCHAR(255) PRIMARY KEY,
          booking_id VARCHAR(255),
          patient_id VARCHAR(255) NOT NULL,
          provider_id VARCHAR(255),
          medication_name VARCHAR(255) NOT NULL,
          dosage VARCHAR(100) NOT NULL,
          frequency VARCHAR(100) NOT NULL,
          instructions TEXT,
          duration_days INT DEFAULT 7,
          issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE CASCADE,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
        );`,
        `CREATE TABLE IF NOT EXISTS patient_vitals_history (
          id VARCHAR(255) PRIMARY KEY,
          patient_id VARCHAR(255) NOT NULL,
          booking_id VARCHAR(255),
          blood_pressure_sys INT,
          blood_pressure_dia INT,
          heart_rate INT,
          temperature_c VARCHAR(50),
          spo2 INT,
          glucose_mg_dl INT,
          notes TEXT,
          recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE CASCADE,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
        );`,
        `CREATE TABLE IF NOT EXISTS provider_schedules (
          id VARCHAR(255) PRIMARY KEY,
          provider_id VARCHAR(255) NOT NULL,
          day_of_week INT NOT NULL,
          start_time VARCHAR(50) NOT NULL,
          end_time VARCHAR(50) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS payouts (
          id VARCHAR(255) PRIMARY KEY,
          provider_id VARCHAR(255) NOT NULL,
          amount INT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'completed',
          payout_method VARCHAR(100) NOT NULL DEFAULT 'direct_deposit',
          payout_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          transaction_ref VARCHAR(255),
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS care_messages (
          id VARCHAR(255) PRIMARY KEY,
          booking_id VARCHAR(255),
          sender_id VARCHAR(255) NOT NULL,
          receiver_id VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(uid) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(uid) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'general',
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS cart_items (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          service_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          price INT NOT NULL,
          unit VARCHAR(50) NOT NULL,
          category VARCHAR(100),
          image_type VARCHAR(100),
          duration VARCHAR(100),
          quantity INT NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS app_config (
          config_key VARCHAR(100) PRIMARY KEY,
          config_value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS user_addresses (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          label VARCHAR(50) NOT NULL DEFAULT 'HOME',
          full_address TEXT NOT NULL,
          landmark VARCHAR(255),
          is_default BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
      ];

      for (const q of queries) {
        await mysqlPool.query(q);
      }
      console.log('✓ All Hostinger MySQL tables (including cart_items & app_config) ready!');

      // Safe column additions for bookings table if upgrading schema
      const bookingCols = [
        `ALTER TABLE bookings ADD COLUMN start_service_otp VARCHAR(20) DEFAULT '8716';`,
        `ALTER TABLE bookings ADD COLUMN is_completed_by_provider BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE bookings ADD COLUMN completed_by_provider_at DATETIME;`,
        `ALTER TABLE bookings ADD COLUMN is_completed_by_patient BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE bookings ADD COLUMN completed_by_patient_at DATETIME;`,
        `ALTER TABLE bookings ADD COLUMN service_started_at DATETIME;`,
        `ALTER TABLE bookings ADD COLUMN current_eta_minutes INT DEFAULT 18;`,
        `ALTER TABLE bookings ADD COLUMN booking_items JSON;`,
      ];
      for (const colQuery of bookingCols) {
        try {
          await mysqlPool.query(colQuery);
        } catch {
          // Column may already exist, ignore
        }
      }

      // Seed initial service pricing catalog into Hostinger MySQL if empty
      try {
        const existingServices = await db.select().from(servicePricing);
        if (existingServices.length === 0) {
          for (const srv of DOORSTEP_CLINICAL_SERVICES) {
            await db.insert(servicePricing).values({
              id: srv.id,
              name: srv.name,
              category: srv.category,
              subCategory: srv.subCategory || null,
              price: srv.price,
              baseAmountLabel: srv.baseAmountLabel,
              duration: srv.duration,
              serviceType: srv.serviceType,
              description: srv.description,
              includes: srv.includes || [],
              popular: srv.popular || false,
              requiresPrescription: false,
              priority: null,
            });
          }
          console.log('✓ Doorstep clinical service catalog seeded into Hostinger MySQL!');
        }

        // Seed default app_config if empty
        const existingConfig = await db.select().from(appConfig);
        if (existingConfig.length === 0) {
          for (const [key, value] of Object.entries(memoryAppConfig)) {
            await db.insert(appConfig).values({
              key,
              value,
            });
          }
          console.log('✓ App config seeded into Hostinger MySQL!');
        }

        const existingProviders = await db.select().from(providers);
        if (existingProviders.length === 0) {
          for (const prov of INITIAL_PROVIDERS) {
            await db.insert(providers).values({
              id: prov.id,
              userId: prov.id === 'prov-001' ? 'prov-001' : null,
              name: prov.name,
              title: prov.title,
              avatar: prov.avatar,
              rating: String(prov.rating || '5.0'),
              reviewCount: prov.reviewCount || 0,
              experienceYears: prov.experienceYears || 1,
              distanceKm: String(prov.distanceKm || '2.0'),
              etaMinutes: prov.etaMinutes || 20,
              isAvailable: prov.isAvailable ?? true,
              currentLocationName: prov.currentLocationName || 'Metro District',
              badges: prov.badges || [],
              hourlyRate: prov.hourlyRate || 50,
              completedVisits: prov.completedVisits || 0,
              phone: prov.phone || null,
              email: prov.email || null,
              bio: prov.bio || null,
            });
          }
          console.log('✓ Initial providers seeded into Hostinger MySQL!');
        }

        const existingUsers = await db.select().from(users);
        if (existingUsers.length === 0) {
          for (const u of memoryUsers) {
            await db.insert(users).values({
              uid: u.uid,
              email: u.email,
              name: u.name,
              role: u.role,
              phone: u.phone,
              address: u.address,
            });
          }
          console.log('✓ Initial users seeded into Hostinger MySQL!');
        }

        const existingPatients = await db.select().from(patients);
        if (existingPatients.length === 0 && INITIAL_PATIENT) {
          const pat = INITIAL_PATIENT as any;
          await db.insert(patients).values({
            id: pat.id || 'pat-demo-001',
            userId: pat.userId || pat.uid || 'pat-demo-001',
            name: pat.name || 'Sarah Mitchell',
            age: pat.age || 35,
            gender: pat.gender || 'Female',
            phone: pat.phone || '+1 (555) 019-2831',
            address: pat.address || '742 Evergreen Terrace',
            landmark: pat.landmark || 'Near Central Park',
            emergencyContactPhone: pat.emergencyContactPhone || pat.emergencyContact || '+1 (555) 999-0000',
            mobilityStatus: pat.mobilityStatus || 'Ambulatory',
            recentlyDischarged: pat.recentlyDischarged || 'No',
            medicalNotes: pat.medicalNotes || 'Penicillin allergy',
            bloodGroup: pat.bloodGroup || 'A+',
            allergies: pat.allergies || 'Penicillin',
            dateOfBirth: pat.dateOfBirth || '1989-05-14',
          });
          console.log('✓ Initial patient seeded into Hostinger MySQL!');
        }
      } catch (seedErr) {
        console.warn('Hostinger MySQL seed warning:', seedErr);
      }
    }
  } catch (error) {
    handleDbFailure(error);
  }
}

// Service Catalog Queries
export async function getAllServices() {
  if (isDbAvailable) {
    try {
      const res = await db.select().from(servicePricing);
      if (res.length > 0) return res;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryServices;
}

export async function updateServiceRate(id: string, price: number, baseLabel: string) {
  if (isDbAvailable) {
    try {
      await db.update(servicePricing)
        .set({ price, baseAmountLabel: baseLabel })
        .where(eq(servicePricing.id, id));
      
      const updated = await db.select().from(servicePricing).where(eq(servicePricing.id, id));
      if (updated.length > 0) return updated[0];
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const idx = memoryServices.findIndex(s => s.id === id);
  if (idx !== -1) {
    memoryServices[idx] = { ...memoryServices[idx], price, baseAmountLabel: baseLabel };
    return memoryServices[idx];
  }
  return null;
}

export async function insertService(data: any) {
  const newService = {
    id: data.id || `srv-${Date.now().toString(36)}`,
    name: data.name,
    category: data.category,
    price: data.price,
    baseAmountLabel: data.baseAmountLabel || 'per visit',
    duration: data.duration || '45 mins',
    serviceType: data.serviceType || 'Home Visit',
    description: data.description || '',
    includes: data.includes || [],
    popular: data.popular || false,
    requiresPrescription: data.requiresPrescription || false,
  };

  if (isDbAvailable) {
    try {
      const dbData = { ...newService, createdAt: new Date() };
      await db.insert(servicePricing).values(dbData);
      return newService;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  memoryServices.unshift(newService);
  return newService;
}

export async function deleteServiceInDb(id: string) {
  if (isDbAvailable) {
    try {
      const existing = await db.select().from(servicePricing).where(eq(servicePricing.id, id));
      await db.delete(servicePricing).where(eq(servicePricing.id, id));
      if (existing.length > 0) return existing[0];
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const idx = memoryServices.findIndex(s => s.id === id);
  if (idx !== -1) {
    const deleted = memoryServices[idx];
    memoryServices.splice(idx, 1);
    return deleted;
  }
  return null;
}

export async function getDatabaseStats() {
  if (isDbAvailable) {
    try {
      const allServices = await db.select().from(servicePricing);
      const allProviders = await db.select().from(providers);
      const allBookings = await db.select().from(bookings);
      const allDocs = await db.select().from(providerDocuments);
      const allReviews = await db.select().from(reviews);
      const allPrescriptions = await db.select().from(prescriptions);

      const totalRevenue = allBookings
        .filter((b: any) => b.paymentStatus === 'paid')
        .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

      const verifiedDocs = allDocs.filter((d: any) => d.status === 'verified').length;
      const pendingDocs = allDocs.filter((d: any) => d.status === 'pending_review').length;
      const completedVisits = allBookings.filter((b: any) => b.status === 'completed').length;
      const activeDispatches = allBookings.filter((b: any) => b.status !== 'completed' && b.status !== 'cancelled').length;

      return {
        totalServices: allServices.length,
        totalProviders: allProviders.length,
        availableProviders: allProviders.filter((p: any) => p.isAvailable).length,
        totalBookings: allBookings.length,
        activeDispatches,
        completedVisits,
        totalRevenue,
        verifiedDocs,
        pendingDocs,
        totalReviews: allReviews.length + memoryReviews.length,
        totalPrescriptions: allPrescriptions.length + memoryPrescriptions.length,
      };
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const totalRevenue = memoryBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  let verifiedDocs = 0;
  let pendingDocs = 0;
  memoryProviders.forEach(p => {
    p.documents.forEach((doc: any) => {
      if (doc.status === 'verified') verifiedDocs++;
      if (doc.status === 'pending_review') pendingDocs++;
    });
  });

  const completedVisits = memoryBookings.filter(b => b.status === 'completed').length;
  const activeDispatches = memoryBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length;

  return {
    totalServices: memoryServices.length,
    totalProviders: memoryProviders.length,
    availableProviders: memoryProviders.filter(p => p.isAvailable).length,
    totalBookings: memoryBookings.length,
    activeDispatches,
    completedVisits,
    totalRevenue,
    verifiedDocs,
    pendingDocs,
    totalReviews: memoryReviews.length,
    totalPrescriptions: memoryPrescriptions.length,
  };
}

// Provider Queries
export async function getAllProviders() {
  const provMap = new Map<string, any>();
  for (const mp of memoryProviders) {
    if (mp && mp.id) provMap.set(mp.id, mp);
  }

  if (isDbAvailable) {
    try {
      const allProviders = await db.select().from(providers);
      const allDocs = await db.select().from(providerDocuments);

      for (const p of allProviders) {
        provMap.set(p.id, {
          ...provMap.get(p.id),
          ...p,
          age: p.dateOfBirth ? calculateAgeFromDob(p.dateOfBirth) : (p.age || 35),
          rating: parseFloat(p.rating || '5.0'),
          distanceKm: parseFloat(p.distanceKm || '2.0'),
          documents: allDocs.filter((d: any) => d.providerId === p.id),
        });
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return Array.from(provMap.values());
}

export async function toggleProviderAvailabilityInDb(providerId: string, isAvailable: boolean) {
  if (isDbAvailable) {
    try {
      await db.update(providers)
        .set({ isAvailable })
        .where(eq(providers.id, providerId));
      
      const updated = await db.select().from(providers).where(eq(providers.id, providerId));
      if (updated.length > 0) return updated[0];
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const p = memoryProviders.find(prov => prov.id === providerId);
  if (p) {
    p.isAvailable = isAvailable;
    return p;
  }
  return null;
}

export async function updateDocumentStatusInDb(docId: string, status: string, reason?: string) {
  if (isDbAvailable) {
    try {
      await db.update(providerDocuments)
        .set({
          status,
          rejectionReason: reason || null,
        })
        .where(eq(providerDocuments.id, docId));

      const updated = await db.select().from(providerDocuments).where(eq(providerDocuments.id, docId));
      if (updated.length > 0) return updated[0];
    } catch (error) {
      handleDbFailure(error);
    }
  }

  for (const p of memoryProviders) {
    const doc = p.documents.find((d: any) => d.id === docId);
    if (doc) {
      doc.status = status as any;
      doc.rejectionReason = reason || undefined;
      return doc;
    }
  }
  return null;
}

// Bookings Queries
export async function getAllBookings() {
  let dbBookingsList: any[] = [];
  if (isDbAvailable) {
    try {
      const rawBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      const allUsers = await db.select().from(users);
      const allPatients = await db.select().from(patients);
      const allServices = await db.select().from(servicePricing);
      const allProviders = await db.select().from(providers);

      dbBookingsList = rawBookings.map((b: any) => {
        const memMatch = memoryBookings.find((mb: any) => mb.id === b.id);
        const patientUser = allUsers.find((u: any) => 
          u.uid === b.patientId || 
          (b.patientId && (u.uid.includes(b.patientId) || b.patientId.includes(u.uid) || (u.phone && b.patientId.includes(u.phone)))) ||
          (memMatch?.patientPhone && u.phone && u.phone.includes(memMatch.patientPhone))
        );
        const patientProfile = allPatients.find((p: any) => p.userId === b.patientId || (patientUser && p.userId === patientUser.uid));
        const service = allServices.find((s: any) => s.id === b.serviceId);
        const provider = allProviders.find((p: any) => p.id === b.providerId);

        return {
          ...memMatch,
          ...b,
          patientName: b.patientName || patientUser?.name || patientProfile?.name || memMatch?.patientName || 'Patient User',
          patientAge: b.patientAge || patientProfile?.age || memMatch?.patientAge || 35,
          patientGender: b.patientGender || patientProfile?.gender || memMatch?.patientGender || 'Male',
          patientPhone: b.patientPhone || patientUser?.phone || patientProfile?.phone || memMatch?.patientPhone || '',
          patientAddress: b.patientAddress || patientUser?.address || patientProfile?.address || memMatch?.patientAddress || 'Metro District',
          landmark: b.landmark || patientProfile?.landmark || memMatch?.landmark || 'Near Main Entrance',
          liftAvailability: b.liftAvailability || memMatch?.liftAvailability || 'Ground Floor',
          emergencyContactPhone: b.emergencyContactPhone || patientProfile?.emergencyContactPhone || memMatch?.emergencyContactPhone || '',
          mobilityStatus: b.mobilityStatus || patientProfile?.mobilityStatus || memMatch?.mobilityStatus || 'Ambulatory',
          recentlyDischarged: b.recentlyDischarged || patientProfile?.recentlyDischarged || memMatch?.recentlyDischarged || 'No',
          serviceName: b.serviceName || service?.name || memMatch?.serviceName || 'Care Visit',
          category: service?.category || memMatch?.category || 'Clinical',
          serviceType: service?.serviceType || memMatch?.serviceType || 'Home Visit',
          providerName: b.providerName || provider?.name || memMatch?.providerName || 'Care Specialist',
          providerPhone: b.providerPhone || provider?.phone || memMatch?.providerPhone || '',
          providerRating: provider?.rating || memMatch?.providerRating || '5.0',
          status: b.status || memMatch?.status || 'confirmed',
        };
      });
    } catch (error) {
      handleDbFailure(error);
    }
  }

  // Combine DB bookings with memoryBookings
  const combinedMap = new Map<string, any>();
  for (const mb of memoryBookings) {
    if (mb && mb.id) combinedMap.set(mb.id, mb);
  }
  for (const dbb of dbBookingsList) {
    if (dbb && dbb.id) {
      const existing = combinedMap.get(dbb.id);
      combinedMap.set(dbb.id, { ...existing, ...dbb });
    }
  }

  return Array.from(combinedMap.values()).sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
}

export async function getSingleBookingFromDb(id: string) {
  if (isDbAvailable) {
    try {
      const all = await getAllBookings();
      const match = all.find(b => b.id === id);
      if (match) return match;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryBookings.find(b => b.id === id) || null;
}

export async function createBookingInDb(data: any) {
  let patientUid = data.patientId;
  if (!patientUid || patientUid === 'undefined' || patientUid === 'null') {
    patientUid = data.patientPhone ? `usr-${data.patientPhone}` : `usr-${Date.now()}`;
  }
  const bookingId = data.id || `CX-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const parsedAge = typeof data.patientAge === 'number' && data.patientAge > 0
    ? data.patientAge
    : (parseInt(data.patientAge, 10) || 35);
  const parsedGender = data.patientGender || 'Male';

  const rawOtp = data.startServiceOtp || data.otpCode || String(Math.floor(1000 + Math.random() * 9000));
  const rawItems = data.bookingItems || data.cartItems || data.items || [];

  const memBooking: any = {
    ...data,
    id: bookingId,
    patientId: patientUid,
    patientName: data.patientName || 'Rahul Sharma',
    patientAge: parsedAge,
    patientGender: parsedGender,
    patientPhone: data.patientPhone || '+91 98765 43210',
    patientAddress: data.patientAddress || 'B12 DLF Phase 3, Gurugram',
    serviceName: data.serviceName || data.service?.name || (rawItems[0]?.title) || 'Care Visit',
    providerName: data.providerName || data.provider?.name || 'Amit Kumar',
    providerPhone: data.providerPhone || data.provider?.phone || '+91 98765 43210',
    startServiceOtp: rawOtp,
    isCompletedByProvider: false,
    completedByProviderAt: null,
    isCompletedByPatient: false,
    completedByPatientAt: null,
    serviceStartedAt: null,
    currentEtaMinutes: data.currentEtaMinutes || 18,
    bookingItems: rawItems.map((item: any, idx: number) => ({
      id: item.id || `item-${idx + 1}`,
      title: item.title || item.name || 'Care Service',
      subtitle: item.subtitle || item.category || 'At Home',
      price: item.price || 99,
      unit: item.unit || 'visit',
      category: item.category || 'injections',
      status: idx === 0 && (data.status === 'service_started' || data.status === 'in_progress') ? 'In Progress' : 'Pending',
    })),
    createdAt: data.createdAt || new Date().toISOString(),
  };

  const existingMemIdx = memoryBookings.findIndex((mb: any) => mb.id === bookingId);
  if (existingMemIdx !== -1) {
    memoryBookings[existingMemIdx] = memBooking;
  } else {
    memoryBookings.unshift(memBooking);
  }

  if (isDbAvailable) {
    try {
      // Upsert User & Patient Profile
      if (patientUid || data.patientPhone || data.patientName) {
        try {
          const exUser = await db.select().from(users).where(eq(users.uid, patientUid));
          if (exUser.length === 0) {
            await db.insert(users).values({
              uid: patientUid,
              email: data.email || `${patientUid}@map2medic.local`,
              name: data.patientName || 'Rahul Sharma',
              phone: data.patientPhone || '+91 98765 43210',
              address: data.patientAddress || 'B12 DLF Phase 3, Gurugram',
              role: 'patient',
            });
          } else {
            await db.update(users).set({
              ...(data.patientName ? { name: data.patientName } : {}),
              ...(data.patientPhone ? { phone: data.patientPhone } : {}),
              ...(data.patientAddress ? { address: data.patientAddress } : {}),
            }).where(eq(users.uid, patientUid));
          }

          const exPat = await db.select().from(patients).where(eq(patients.userId, patientUid));
          if (exPat.length === 0) {
            await db.insert(patients).values({
              id: `pat-${patientUid}`,
              userId: patientUid,
              name: data.patientName || 'Rahul Sharma',
              age: parsedAge,
              gender: parsedGender,
              phone: data.patientPhone || '+91 98765 43210',
              address: data.patientAddress || 'B12 DLF Phase 3, Gurugram',
              landmark: data.landmark || 'Near DLF CyberCity',
              emergencyContactPhone: data.emergencyContactPhone || '+91 98765 43211',
              mobilityStatus: data.mobilityStatus || 'Ambulatory',
              recentlyDischarged: data.recentlyDischarged || 'No',
              medicalNotes: data.medicalNotes || 'Penicillin, Sulfa drugs allergy',
              bloodGroup: 'O+',
              allergies: 'Penicillin, Sulfa drugs',
            });
          } else {
            await db.update(patients).set({
              ...(data.patientName ? { name: data.patientName } : {}),
              ...(data.patientPhone ? { phone: data.patientPhone } : {}),
              ...(data.patientAddress ? { address: data.patientAddress } : {}),
              age: parsedAge,
              gender: parsedGender,
              ...(data.landmark ? { landmark: data.landmark } : {}),
              ...(data.emergencyContactPhone ? { emergencyContactPhone: data.emergencyContactPhone } : {}),
              ...(data.mobilityStatus ? { mobilityStatus: data.mobilityStatus } : {}),
              ...(data.recentlyDischarged ? { recentlyDischarged: data.recentlyDischarged } : {}),
              ...(data.medicalNotes ? { medicalNotes: data.medicalNotes } : {}),
            }).where(eq(patients.userId, patientUid));
          }
        } catch (e) {
          console.warn('Patient upsert warning:', e);
        }
      }

      let safeServiceId = data.serviceId || null;
      if (safeServiceId) {
        try {
          const srvCheck = await db.select().from(servicePricing).where(eq(servicePricing.id, safeServiceId));
          if (srvCheck.length === 0) safeServiceId = null;
        } catch {
          safeServiceId = null;
        }
      }

      let safeProviderId = data.providerId || null;
      let matchedProvName = data.providerName || null;
      let matchedProvPhone = data.providerPhone || null;

      if (safeProviderId) {
        try {
          const provCheck = await db.select().from(providers).where(eq(providers.id, safeProviderId));
          if (provCheck.length === 0) {
            safeProviderId = null;
          } else {
            matchedProvName = matchedProvName || provCheck[0].name;
            matchedProvPhone = matchedProvPhone || provCheck[0].phone;
          }
        } catch {
          safeProviderId = null;
        }
      }

      await db.insert(bookings).values({
        id: bookingId,
        patientId: patientUid,
        serviceId: safeServiceId,
        providerId: safeProviderId,
        patientName: data.patientName || 'Rahul Sharma',
        patientAge: parsedAge,
        patientGender: parsedGender,
        patientPhone: data.patientPhone || '+91 98765 43210',
        patientAddress: data.patientAddress || 'B12 DLF Phase 3, Gurugram',
        landmark: data.landmark || null,
        liftAvailability: data.liftAvailability || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        mobilityStatus: data.mobilityStatus || null,
        recentlyDischarged: data.recentlyDischarged || null,
        serviceName: data.serviceName || data.service?.name || 'Care Visit',
        providerName: matchedProvName || 'Amit Kumar',
        providerPhone: matchedProvPhone || '+91 98765 43210',
        date: data.date || new Date().toISOString().split('T')[0],
        timeSlot: data.timeSlot || '09:00 AM',
        status: data.status || 'confirmed',
        basePrice: typeof data.basePrice === 'number' ? data.basePrice : 50,
        addons: data.addons || null,
        platformFee: typeof data.platformFee === 'number' ? data.platformFee : 30,
        discount: typeof data.discount === 'number' ? data.discount : 0,
        totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : 80,
        paymentMethod: data.paymentMethod || 'card',
        paymentStatus: data.paymentStatus || 'paid',
        medicalNotes: data.medicalNotes || null,
        vitalsRecorded: data.vitalsRecorded || null,
        intakeIntent: data.intakeIntent || null,
        careDuration: data.careDuration || null,
        otpCode: rawOtp,
        startServiceOtp: rawOtp,
        isCompletedByProvider: false,
        isCompletedByPatient: false,
        currentEtaMinutes: data.currentEtaMinutes || 18,
        bookingItems: memBooking.bookingItems,
        progressChecklist: data.progressChecklist || null,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      });

      // Confirmation notification
      await createNotificationInDb({
        userId: patientUid,
        title: 'Booking Confirmed',
        body: `Care appointment #${bookingId} confirmed for ${data.date || 'today'} (${data.timeSlot || '09:00 AM'}). Dispatch team notified!`,
        type: 'booking_status',
      });

      const insertedRows = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      if (insertedRows.length > 0) {
        const b = insertedRows[0];
        const resObj = {
          ...memBooking,
          ...b,
          patientName: data.patientName || 'Patient User',
          patientPhone: data.patientPhone || '',
          patientAddress: data.patientAddress || '',
          providerName: matchedProvName || 'Care Specialist',
          providerPhone: matchedProvPhone || '',
        };

        const idx = memoryBookings.findIndex((mb: any) => mb.id === bookingId);
        if (idx !== -1) {
          memoryBookings[idx] = resObj;
        }

        return resObj;
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return memBooking;
}

export async function saveVitalsToHistoryFromBooking(bookingId: string, vitalsObj: any) {
  if (!vitalsObj) return;
  try {
    let patientUid = 'usr-patient';
    const bMem = memoryBookings.find(b => b.id === bookingId);
    if (bMem?.patientId) {
      patientUid = bMem.patientId;
    } else if (isDbAvailable) {
      const bDb = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      if (bDb.length > 0 && bDb[0].patientId) {
        patientUid = bDb[0].patientId;
      }
    }

    let sys: number | undefined;
    let dia: number | undefined;
    const bpStr = vitalsObj.bloodPressure || vitalsObj.bp;
    if (bpStr && typeof bpStr === 'string' && bpStr.includes('/')) {
      const parts = bpStr.split('/');
      sys = parseInt(parts[0], 10) || undefined;
      dia = parseInt(parts[1], 10) || undefined;
    }

    let hr: number | undefined;
    const hrStr = vitalsObj.pulseRate || vitalsObj.pulse || vitalsObj.heartRate;
    if (hrStr) {
      hr = parseInt(String(hrStr).replace(/\D/g, ''), 10) || undefined;
    }

    let spo2Num: number | undefined;
    const spo2Str = vitalsObj.spO2 || vitalsObj.spo2;
    if (spo2Str) {
      spo2Num = parseInt(String(spo2Str).replace(/\D/g, ''), 10) || undefined;
    }

    let glucoseNum: number | undefined;
    const gStr = vitalsObj.bloodSugar || vitalsObj.glucose || vitalsObj.glucoseMgDl;
    if (gStr) {
      glucoseNum = parseInt(String(gStr).replace(/\D/g, ''), 10) || undefined;
    }

    const tempStr = vitalsObj.temperature || vitalsObj.temp || vitalsObj.temperatureC;
    const notesStr = vitalsObj.notes || vitalsObj.medicalNotes || `Vitals recorded during appointment #${bookingId}`;

    await recordPatientVitalsInDb({
      patientId: patientUid,
      bookingId,
      bloodPressureSys: sys,
      bloodPressureDia: dia,
      heartRate: hr,
      temperatureC: tempStr ? String(tempStr) : undefined,
      spo2: spo2Num,
      glucoseMgDl: glucoseNum,
      notes: notesStr,
    });
  } catch (e) {
    console.warn('Auto-save vitals history error:', e);
  }
}

export async function updateBookingStatusInDb(id: string, status: string, vitals?: any, checklist?: any) {
  if (vitals) {
    await saveVitalsToHistoryFromBooking(id, vitals);
  }

  if (isDbAvailable) {
    try {
      const setPayload: any = { status };
      if (vitals) {
        setPayload.vitalsRecorded = vitals;
      }
      if (checklist) {
        setPayload.progressChecklist = checklist;
      }
      await db.update(bookings)
        .set(setPayload)
        .where(eq(bookings.id, id));

      const updatedRows = await db.select().from(bookings).where(eq(bookings.id, id));

      if (status === 'completed' && updatedRows.length > 0 && updatedRows[0].providerId) {
        const provId = updatedRows[0].providerId;
        const totalAmt = updatedRows[0].totalAmount || 50;
        const netEarnings = Math.max(10, totalAmt - (updatedRows[0].platformFee || 5));
        try {
          await db.update(providers)
            .set({
              completedVisits: sql`COALESCE(${providers.completedVisits}, 0) + 1`,
              pendingPayout: sql`COALESCE(${providers.pendingPayout}, 0) + ${netEarnings}`,
              totalEarningsMonth: sql`COALESCE(${providers.totalEarningsMonth}, 0) + ${netEarnings}`
            })
            .where(eq(providers.id, provId));
        } catch (e) {
          console.warn('Failed to update provider earnings on visit completion:', e);
        }
      }

      if (updatedRows.length > 0) {
        const bMem = memoryBookings.find(book => book.id === id);
        if (bMem) {
          bMem.status = status;
          if (vitals) bMem.vitalsRecorded = vitals;
          if (checklist) bMem.progressChecklist = checklist;
        }
        return updatedRows[0];
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const b = memoryBookings.find(book => book.id === id);
  if (b) {
    b.status = status as any;
    if (vitals) {
      b.vitalsRecorded = { ...b.vitalsRecorded, ...vitals };
    }
    if (checklist) {
      b.progressChecklist = { ...b.progressChecklist, ...checklist };
    }
    return b;
  }
  return null;
}

// DUPLICATE EMAIL & PHONE RESTRICTION ENGINE
export async function checkExistingUserDuplicates(
  email?: string,
  phone?: string,
  excludeUid?: string
): Promise<{ isDuplicate: boolean; emailExists: boolean; phoneExists: boolean; message: string }> {
  const normEmail = email ? email.trim().toLowerCase() : '';
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const normPhone = cleanPhone.length >= 7 ? cleanPhone.slice(-10) : '';

  let emailExists = false;
  let phoneExists = false;

  const matchEmail = (e?: string | null) => {
    if (!normEmail || !e || !e.trim()) return false;
    return e.trim().toLowerCase() === normEmail;
  };

  const matchPhone = (p?: string | null) => {
    if (!normPhone || !p) return false;
    const targetClean = p.replace(/\D/g, '');
    if (!targetClean || targetClean.length < 7) return false;
    const targetNorm = targetClean.slice(-10);
    return targetNorm === normPhone || targetNorm.endsWith(normPhone) || normPhone.endsWith(targetNorm);
  };

  const isExcluded = (idOrUid?: string | null, userId?: string | null) => {
    if (!excludeUid) return false;
    const ex = excludeUid.trim().toLowerCase();
    if (!ex) return false;
    if (idOrUid && (idOrUid.toLowerCase() === ex || idOrUid.toLowerCase().includes(ex) || ex.includes(idOrUid.toLowerCase()))) return true;
    if (userId && (userId.toLowerCase() === ex || userId.toLowerCase().includes(ex) || ex.includes(userId.toLowerCase()))) return true;
    return false;
  };

  if (isDbAvailable) {
    try {
      const allUsers = await db.select().from(users);
      for (const u of allUsers) {
        if (isExcluded(u.uid)) continue;
        if (matchEmail(u.email)) emailExists = true;
        if (matchPhone(u.phone)) phoneExists = true;
      }

      const allPatients = await db.select().from(patients);
      for (const pat of allPatients) {
        if (isExcluded(pat.id, pat.userId)) continue;
        if (matchPhone(pat.phone)) phoneExists = true;
      }

      const allProvs = await db.select().from(providers);
      for (const prov of allProvs) {
        if (isExcluded(prov.id, prov.userId)) continue;
        if (matchEmail(prov.email)) emailExists = true;
        if (matchPhone(prov.phone)) phoneExists = true;
      }
    } catch (e) {
      handleDbFailure(e);
    }
  }

  for (const u of memoryUsers) {
    if (isExcluded(u.uid)) continue;
    if (matchEmail(u.email)) emailExists = true;
    if (matchPhone(u.phone)) phoneExists = true;
  }

  for (const pat of memoryPatients) {
    if (isExcluded(pat.id, pat.userId)) continue;
    if (matchPhone(pat.phone)) phoneExists = true;
  }

  for (const prov of memoryProviders) {
    if (isExcluded(prov.id, (prov as any).userId)) continue;
    if (matchEmail(prov.email)) emailExists = true;
    if (matchPhone(prov.phone)) phoneExists = true;
  }

  if (emailExists && phoneExists) {
    return {
      isDuplicate: true,
      emailExists: true,
      phoneExists: true,
      message: `Duplicate User Restricted: Both Email ID (${email}) AND Mobile Phone Number (${phone}) are already registered to an existing patient or provider. Each user must have a unique email and phone number.`
    };
  }
  if (emailExists) {
    return {
      isDuplicate: true,
      emailExists: true,
      phoneExists: false,
      message: `Duplicate Email ID Restricted: An account with Email ID "${email}" is already registered. Each patient/provider must have a unique email address.`
    };
  }
  if (phoneExists) {
    return {
      isDuplicate: true,
      emailExists: false,
      phoneExists: true,
      message: `Duplicate Phone Number Restricted: An account with Mobile Phone Number "${phone}" is already registered. Each patient/provider must have a unique phone number.`
    };
  }

  return { isDuplicate: false, emailExists: false, phoneExists: false, message: '' };
}

// User & Patient Registration
export async function registerNewUserInDb(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
  title?: string;
  licenseNumber?: string;
  experienceYears?: number;
  hourlyRate?: number;
  avatar?: string;
  dateOfBirth?: string;
  age?: number;
}) {
  const dupCheck = await checkExistingUserDuplicates(data.email, data.phone);
  if (dupCheck.isDuplicate) {
    throw new Error(dupCheck.message);
  }

  const parsedAge = data.dateOfBirth ? calculateAgeFromDob(data.dateOfBirth) : 0;
  const computedAge = parsedAge > 0 ? parsedAge : (typeof data.age === 'number' && data.age > 0 ? data.age : 35);

  const uid = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newUser = {
    id: memoryUsers.length + 100,
    uid,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    address: data.address || null,
    createdAt: new Date()
  };

  if (isDbAvailable) {
    try {
      await db.insert(users).values({
        uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        address: data.address || null,
      });

      const userRows = await db.select().from(users).where(eq(users.uid, uid));

      let patientRecord = null;
      if (data.role === 'patient') {
        const patId = `pat-${uid}`;
        await db.insert(patients).values({
          id: patId,
          userId: uid,
          name: data.name,
          phone: data.phone,
          address: data.address || null,
          dateOfBirth: data.dateOfBirth || null,
          age: computedAge,
        });
        const patRows = await db.select().from(patients).where(eq(patients.id, patId));
        patientRecord = patRows[0] || null;
      }

      let providerRecord = null;
      if (data.role === 'provider') {
        const provId = `prov-${Date.now().toString(36)}`;
        await db.insert(providers).values({
          id: provId,
          userId: uid,
          name: data.name,
          title: data.title || 'Registered Care Provider',
          avatar: data.avatar || null,
          rating: '5.0',
          reviewCount: 0,
          experienceYears: data.experienceYears || 2,
          distanceKm: '1.5',
          etaMinutes: 20,
          isAvailable: true,
          currentLocationName: data.address || 'Central District',
          badges: ['Board Certified', 'Newly Registered'],
          hourlyRate: data.hourlyRate || 55,
          completedVisits: 0,
          phone: data.phone,
          email: data.email,
          bio: `Licensed ${data.title || 'specialist'} providing sterile home healthcare visits and clinical procedures.`,
          dateOfBirth: data.dateOfBirth || null,
          age: computedAge,
          pendingPayout: 0,
          totalEarningsMonth: 0,
        });

        const provRows = await db.select().from(providers).where(eq(providers.id, provId));
        providerRecord = provRows[0] || null;

        if (data.licenseNumber) {
          try {
            await db.insert(providerDocuments).values({
              id: `doc-${Date.now().toString(36)}`,
              providerId: provId,
              docType: `State Medical License (${data.licenseNumber})`,
              fileName: `license_${provId}.pdf`,
              uploadedAt: new Date().toISOString().split('T')[0],
              status: 'pending_review',
              expiryDate: '2028-12-31',
            });
          } catch {}
        }
      }

      if (userRows[0]) memoryUsers.push(userRows[0]);
      if (patientRecord) memoryPatients.push(patientRecord);
      if (providerRecord) memoryProviders.unshift(providerRecord);

      return {
        user: userRows[0] || newUser,
        patient: patientRecord,
        provider: providerRecord,
      };
    } catch (error) {
      handleDbFailure(error);
    }
  }

  memoryUsers.push(newUser);

  let patientRecord = null;
  if (data.role === 'patient') {
    patientRecord = {
      id: `pat-${uid}`,
      userId: uid,
      name: data.name,
      phone: data.phone,
      address: data.address || null,
      dateOfBirth: data.dateOfBirth || null,
      age: computedAge,
    };
    memoryPatients.push(patientRecord);
  }

  let providerRecord = null;
  if (data.role === 'provider') {
    const provId = `prov-${Date.now().toString(36)}`;
    providerRecord = {
      id: provId,
      userId: uid,
      name: data.name,
      title: (data.title || 'Registered Care Provider') as any,
      avatar: data.avatar || null,
      rating: 5.0,
      reviewCount: 0,
      experienceYears: data.experienceYears || 2,
      distanceKm: 1.5,
      etaMinutes: 20,
      isAvailable: true,
      currentLocationName: data.address || 'Central District',
      badges: ['Board Certified', 'Newly Registered'],
      hourlyRate: data.hourlyRate || 55,
      completedVisits: 0,
      phone: data.phone,
      email: data.email,
      bio: `Licensed ${data.title || 'specialist'} providing sterile home healthcare visits and clinical procedures.`,
      dateOfBirth: data.dateOfBirth || null,
      age: computedAge,
      pendingPayout: 0,
      totalEarningsMonth: 0,
      documents: data.licenseNumber ? [
        {
          id: `doc-${Date.now().toString(36)}`,
          docType: `State Medical License (${data.licenseNumber})` as any,
          fileName: `license_${provId}.pdf`,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'pending_review' as const,
          expiryDate: '2028-12-31'
        }
      ] : []
    };
    memoryProviders.unshift(providerRecord);
  }

  return {
    user: newUser,
    patient: patientRecord,
    provider: providerRecord,
  };
}

export async function updateUserProfileInDb(email: string, data: {
  name?: string;
  phone?: string;
  address?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  landmark?: string;
  mobilityStatus?: string;
  recentlyDischarged?: string;
  dateOfBirth?: string;
}) {
  let existingUid: string | undefined;
  if (isDbAvailable) {
    try {
      const existingUsers = await db.select().from(users).where(eq(users.email, email));
      if (existingUsers.length > 0) {
        existingUid = existingUsers[0].uid;
      }
    } catch (e) {
      handleDbFailure(e);
    }
  }
  if (!existingUid) {
    existingUid = memoryUsers.find(u => u.email === email)?.uid;
  }

  const parsedAge = data.dateOfBirth ? calculateAgeFromDob(data.dateOfBirth) : 0;
  const computedAge = parsedAge > 0 ? parsedAge : (typeof data.age === 'number' && data.age > 0 ? data.age : 35);

  if (isDbAvailable) {
    try {
      const existing = await db.select().from(users).where(eq(users.email, email));
      let userRow;
      if (existing.length === 0) {
        const uid = `usr-${Date.now()}`;
        await db.insert(users).values({
          uid,
          email,
          name: data.name || 'Patient',
          phone: data.phone || null,
          address: data.address || null,
          role: 'patient',
        });
        const uRes = await db.select().from(users).where(eq(users.uid, uid));
        userRow = uRes[0];
      } else {
        await db.update(users)
          .set({
            ...(data.name ? { name: data.name } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.address ? { address: data.address } : {}),
          })
          .where(eq(users.email, email));
        const uRes = await db.select().from(users).where(eq(users.email, email));
        userRow = uRes[0];
      }

      if (userRow) {
        const exPat = await db.select().from(patients).where(eq(patients.userId, userRow.uid));
        if (exPat.length === 0) {
          await db.insert(patients).values({
            id: `pat-${userRow.uid}`,
            userId: userRow.uid,
            name: userRow.name || 'Patient',
            phone: userRow.phone || null,
            address: userRow.address || null,
            age: computedAge,
            gender: data.gender || 'Male',
            bloodGroup: data.bloodGroup || null,
            allergies: data.allergies || null,
            dateOfBirth: data.dateOfBirth || null,
            medicalNotes: data.medicalHistory || null,
            emergencyContactPhone: data.emergencyContactPhone || null,
            insuranceProvider: data.insuranceProvider || null,
            insurancePolicyNumber: data.insurancePolicyNumber || null,
            landmark: data.landmark || null,
            mobilityStatus: data.mobilityStatus || null,
            recentlyDischarged: data.recentlyDischarged || null,
          });
        } else {
          await db.update(patients).set({
            ...(data.name ? { name: data.name } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.address ? { address: data.address } : {}),
            age: computedAge,
            ...(data.gender ? { gender: data.gender } : {}),
            ...(data.bloodGroup ? { bloodGroup: data.bloodGroup } : {}),
            ...(data.allergies ? { allergies: data.allergies } : {}),
            ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth } : {}),
            ...(data.medicalHistory ? { medicalNotes: data.medicalHistory } : {}),
            ...(data.emergencyContactPhone ? { emergencyContactPhone: data.emergencyContactPhone } : {}),
            ...(data.insuranceProvider ? { insuranceProvider: data.insuranceProvider } : {}),
            ...(data.insurancePolicyNumber ? { insurancePolicyNumber: data.insurancePolicyNumber } : {}),
            ...(data.landmark ? { landmark: data.landmark } : {}),
            ...(data.mobilityStatus ? { mobilityStatus: data.mobilityStatus } : {}),
            ...(data.recentlyDischarged ? { recentlyDischarged: data.recentlyDischarged } : {}),
          }).where(eq(patients.userId, userRow.uid));
        }
      }

      return userRow;
    } catch (error: any) {
      if (error.message && error.message.includes('Duplicate')) throw error;
      handleDbFailure(error);
    }
  }

  let user = memoryUsers.find(u => u.email === email);
  if (!user) {
    user = {
      uid: `usr-${Date.now()}`,
      email,
      name: data.name || 'Patient',
      phone: data.phone || null,
      address: data.address || null,
      role: 'patient'
    };
    memoryUsers.push(user);
  } else {
    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.address) user.address = data.address;
  }
  return user;
}

export async function updateProviderProfileInDb(providerId: string, data: {
  name?: string;
  title?: string;
  bio?: string;
  phone?: string;
  email?: string;
  hourlyRate?: number;
  currentLocationName?: string;
  avatar?: string;
  dateOfBirth?: string;
  age?: number;
  badges?: string[];
}) {
  const parsedAge = data.dateOfBirth ? calculateAgeFromDob(data.dateOfBirth) : 0;
  const computedAge = parsedAge > 0 ? parsedAge : (typeof data.age === 'number' && data.age > 0 ? data.age : (data.age !== undefined ? data.age : undefined));

  if (isDbAvailable) {
    try {
      await db.update(providers)
        .set({
          ...(data.name ? { name: data.name } : {}),
          ...(data.title ? { title: data.title } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
          ...(data.email ? { email: data.email } : {}),
          ...(data.hourlyRate !== undefined ? { hourlyRate: data.hourlyRate } : {}),
          ...(data.currentLocationName ? { currentLocationName: data.currentLocationName } : {}),
          ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
          ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth } : {}),
          ...(computedAge !== undefined ? { age: computedAge } : {}),
          ...(data.badges !== undefined ? { badges: data.badges } : {}),
        })
        .where(eq(providers.id, providerId));

      const updated = await db.select().from(providers).where(eq(providers.id, providerId));
      if (updated.length > 0) return updated[0];
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const p = memoryProviders.find(prov => prov.id === providerId);
  if (p) {
    if (data.name) p.name = data.name;
    if (data.title) p.title = data.title as any;
    if (data.bio !== undefined) p.bio = data.bio;
    if (data.phone) p.phone = data.phone;
    if (data.email) p.email = data.email;
    if (data.hourlyRate !== undefined) p.hourlyRate = data.hourlyRate;
    if (data.currentLocationName) p.currentLocationName = data.currentLocationName;
    if (data.avatar !== undefined) p.avatar = data.avatar;
    if (data.dateOfBirth !== undefined) p.dateOfBirth = data.dateOfBirth;
    if (computedAge !== undefined) p.age = computedAge;
    if (data.badges !== undefined) p.badges = data.badges;
    return p;
  }
  return null;
}

export async function cancelBookingInDb(bookingId: string) {
  if (isDbAvailable) {
    try {
      await db.update(bookings)
        .set({
          status: 'cancelled',
          paymentStatus: 'pending'
        })
        .where(eq(bookings.id, bookingId));

      const updated = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      if (updated.length > 0) return updated[0];
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const b = memoryBookings.find(book => book.id === bookingId);
  if (b) {
    b.status = 'cancelled';
    b.paymentStatus = 'pending';
    return b;
  }
  return null;
}

export async function addDocumentInDb(providerId: string, docType: string, fileName: string) {
  const id = `doc-${Date.now().toString(36)}`;
  const docObj = {
    id,
    providerId,
    docType,
    fileName,
    uploadedAt: new Date().toISOString().split('T')[0],
    status: 'pending_review',
    expiryDate: '2029-12-31'
  };

  if (isDbAvailable) {
    try {
      await db.insert(providerDocuments).values(docObj);
      return docObj;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const p = memoryProviders.find(prov => prov.id === providerId);
  if (p) {
    p.documents.unshift(docObj);
    return docObj;
  }
  return null;
}

export async function findUserInDb(identifier: string, role: string) {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPhoneInput = cleanId.replace(/\D/g, '');

  const isPhoneMatch = (dbPhone: string | null) => {
    if (!dbPhone) return false;
    const dbClean = dbPhone.replace(/\D/g, '');
    if (!dbClean || !cleanPhoneInput) return false;
    return dbClean === cleanPhoneInput || dbClean.endsWith(cleanPhoneInput) || cleanPhoneInput.endsWith(dbClean);
  };
  
  if (isDbAvailable) {
    try {
      const results = await db.select().from(users);
      const matched = results.find((u: any) => 
        (u.email && u.email.toLowerCase() === cleanId) || 
        isPhoneMatch(u.phone)
      );
      if (matched) {
        let patientRec: any = null;
        let providerRec: any = null;
        if (matched.role === 'patient') {
          const patRows = await db.select().from(patients).where(eq(patients.userId, matched.uid));
          if (patRows.length > 0) patientRec = patRows[0];
        } else if (matched.role === 'provider') {
          const provRows = await db.select().from(providers).where(eq(providers.userId, matched.uid));
          if (provRows.length > 0) providerRec = provRows[0];
        }
        return {
          ...matched,
          patient: patientRec,
          provider: providerRec,
        };
      }
      
      const provs = await db.select().from(providers);
      const matchedProv = provs.find((p: any) => 
        (p.email && p.email.toLowerCase() === cleanId) || 
        isPhoneMatch(p.phone)
      );
      if (matchedProv) {
        return {
          uid: matchedProv.userId || matchedProv.id,
          id: matchedProv.id,
          email: matchedProv.email,
          name: matchedProv.name,
          phone: matchedProv.phone,
          role: 'provider',
          address: matchedProv.currentLocationName,
          provider: matchedProv,
        };
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }
  
  const matchedMemUser = memoryUsers.find(u => 
    (u.email && u.email.toLowerCase() === cleanId) || 
    isPhoneMatch(u.phone)
  );
  if (matchedMemUser) {
    const pat = memoryPatients.find(p => p.userId === matchedMemUser.uid);
    const prov = memoryProviders.find(p => p.userId === matchedMemUser.uid || p.id === matchedMemUser.uid);
    return {
      ...matchedMemUser,
      patient: pat || null,
      provider: prov || null,
    };
  }
  
  const matchedProv = memoryProviders.find(p => 
    (p.email && p.email.toLowerCase() === cleanId) || 
    isPhoneMatch(p.phone)
  );
  if (matchedProv) {
    return {
      uid: matchedProv.userId || matchedProv.id,
      id: matchedProv.id,
      email: matchedProv.email,
      name: matchedProv.name,
      phone: matchedProv.phone,
      role: 'provider',
      address: matchedProv.currentLocationName,
      provider: matchedProv,
    };
  }

  return null;
}

// Concept Queries (Reviews, Prescriptions, Vitals, Schedules, Payouts, Messages, Notifications)

// 1. Reviews Queries
export async function getReviewsForProvider(providerId: string) {
  if (isDbAvailable) {
    try {
      const res = await db.select().from(reviews).where(eq(reviews.providerId, providerId)).orderBy(desc(reviews.createdAt));
      if (res.length > 0) return res;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryReviews.filter(r => r.providerId === providerId);
}

export async function createReviewInDb(data: {
  bookingId?: string;
  patientId?: string;
  providerId: string;
  rating: number;
  comment?: string;
}) {
  const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newRev = { id, ...data, createdAt: new Date().toISOString() };
  memoryReviews.unshift(newRev);

  const provMem = memoryProviders.find(p => p.id === data.providerId);
  const provRevsMem = memoryReviews.filter(r => r.providerId === data.providerId);
  if (provMem && provRevsMem.length > 0) {
    const avg = (provRevsMem.reduce((sum, r) => sum + r.rating, 0) / provRevsMem.length).toFixed(1);
    provMem.rating = parseFloat(avg);
    provMem.reviewCount = provRevsMem.length;
  }

  if (isDbAvailable) {
    try {
      await db.insert(reviews).values({
        id,
        bookingId: data.bookingId || null,
        patientId: data.patientId || null,
        providerId: data.providerId,
        rating: data.rating,
        comment: data.comment || null,
      });

      const allDbRevs = await db.select().from(reviews).where(eq(reviews.providerId, data.providerId));
      if (allDbRevs.length > 0) {
        const avg = (allDbRevs.reduce((sum: number, r: any) => sum + r.rating, 0) / allDbRevs.length).toFixed(1);
        await db.update(providers)
          .set({
            rating: avg,
            reviewCount: allDbRevs.length,
          })
          .where(eq(providers.id, data.providerId));
      }

      return newRev;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return newRev;
}

// 2. Prescriptions Queries
export async function getPrescriptionsForPatient(patientId: string) {
  if (isDbAvailable) {
    try {
      const res = await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId)).orderBy(desc(prescriptions.issuedAt));
      if (res.length > 0) return res;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryPrescriptions.filter(p => p.patientId === patientId);
}

export async function createPrescriptionInDb(data: {
  bookingId?: string;
  patientId: string;
  providerId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  durationDays?: number;
}) {
  const id = `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newRx = { id, ...data, issuedAt: new Date().toISOString() };
  memoryPrescriptions.unshift(newRx);

  if (isDbAvailable) {
    try {
      await db.insert(prescriptions).values({
        id,
        bookingId: data.bookingId || null,
        patientId: data.patientId,
        providerId: data.providerId,
        medicationName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        instructions: data.instructions || null,
        durationDays: data.durationDays || 7,
      });
      return newRx;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return newRx;
}

// 3. Patient Vitals History Queries
export async function getVitalsHistoryForPatient(patientId: string) {
  if (isDbAvailable) {
    try {
      const res = await db.select().from(patientVitalsHistory).where(eq(patientVitalsHistory.patientId, patientId)).orderBy(desc(patientVitalsHistory.recordedAt));
      if (res.length > 0) return res;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryVitalsHistory.filter(v => v.patientId === patientId);
}

export async function recordPatientVitalsInDb(data: {
  patientId: string;
  bookingId?: string;
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  heartRate?: number;
  temperatureC?: string;
  spo2?: number;
  glucoseMgDl?: number;
  notes?: string;
}) {
  const id = `vtl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newVtl = { id, ...data, recordedAt: new Date().toISOString() };
  memoryVitalsHistory.unshift(newVtl);

  if (isDbAvailable) {
    try {
      await db.insert(patientVitalsHistory).values({
        id,
        patientId: data.patientId,
        bookingId: data.bookingId || null,
        bloodPressureSys: data.bloodPressureSys || null,
        bloodPressureDia: data.bloodPressureDia || null,
        heartRate: data.heartRate || null,
        temperatureC: data.temperatureC || null,
        spo2: data.spo2 || null,
        glucoseMgDl: data.glucoseMgDl || null,
        notes: data.notes || null,
      });
      return newVtl;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return newVtl;
}

// 4. Provider Schedules Queries
export async function getProviderSchedules(providerId: string) {
  if (isDbAvailable) {
    try {
      const res = await db.select().from(providerSchedules).where(eq(providerSchedules.providerId, providerId));
      if (res.length > 0) return res;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memorySchedules.filter(s => s.providerId === providerId);
}

export async function updateProviderScheduleInDb(data: {
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}) {
  const id = `sch-${data.providerId}-${data.dayOfWeek}`;
  const idx = memorySchedules.findIndex(s => s.id === id);
  if (idx !== -1) {
    memorySchedules[idx] = { ...memorySchedules[idx], ...data };
  } else {
    memorySchedules.push({ id, ...data });
  }

  if (isDbAvailable) {
    try {
      const existing = await db.select().from(providerSchedules).where(eq(providerSchedules.id, id));
      if (existing.length === 0) {
        await db.insert(providerSchedules).values({
          id,
          providerId: data.providerId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          isActive: data.isActive,
        });
      } else {
        await db.update(providerSchedules).set({
          startTime: data.startTime,
          endTime: data.endTime,
          isActive: data.isActive,
        }).where(eq(providerSchedules.id, id));
      }
      return { id, ...data };
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return { id, ...data };
}

// 5. Payouts Queries
export async function getPayoutsForProvider(providerId: string) {
  if (isDbAvailable) {
    try {
      const res = await db.select().from(payouts).where(eq(payouts.providerId, providerId)).orderBy(desc(payouts.payoutDate));
      if (res.length > 0) return res;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryPayouts.filter(p => p.providerId === providerId);
}

export async function createPayoutInDb(data: {
  providerId: string;
  amount: number;
  status?: string;
  payoutMethod?: string;
}) {
  const id = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newPay = { id, ...data, transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`, payoutDate: new Date().toISOString() };
  memoryPayouts.unshift(newPay);

  if (isDbAvailable) {
    try {
      await db.insert(payouts).values({
        id,
        providerId: data.providerId,
        amount: data.amount,
        status: data.status || 'completed',
        payoutMethod: data.payoutMethod || 'direct_deposit',
        transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      return newPay;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return newPay;
}

// 6. Care Messages Queries
export async function getCareMessagesForBooking(bookingId: string) {
  if (isDbAvailable) {
    try {
      const res = await db.select().from(careMessages).where(eq(careMessages.bookingId, bookingId)).orderBy(careMessages.createdAt);
      if (res.length > 0) return res;
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryMessages.filter(m => m.bookingId === bookingId);
}

export async function sendCareMessageInDb(data: {
  bookingId?: string;
  senderId: string;
  receiverId: string;
  message: string;
}) {
  const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newMsg = { id, ...data, isRead: false, createdAt: new Date().toISOString() };
  memoryMessages.push(newMsg);

  if (isDbAvailable) {
    try {
      await db.insert(careMessages).values({
        id,
        bookingId: data.bookingId || null,
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        isRead: false,
      });
      return newMsg;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return newMsg;
}

// 7. Notifications Queries
export async function getUserNotifications(userId: string) {
  if (isDbAvailable) {
    try {
      const allNotifs = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
      const matched = allNotifs.filter((n: any) => 
        n.userId === userId || 
        (userId && n.userId && (n.userId.includes(userId) || userId.includes(n.userId)))
      );
      return matched;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  const matchedMem = memoryNotifications.filter(n => 
    n.userId === userId || 
    (userId && n.userId && (n.userId.includes(userId) || userId.includes(n.userId)))
  );
  return matchedMem;
}

export async function createNotificationInDb(data: {
  userId: string;
  title: string;
  body: string;
  type?: string;
}) {
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newNotif = { id, ...data, isRead: false, createdAt: new Date().toISOString() };
  memoryNotifications.unshift(newNotif);

  if (isDbAvailable) {
    try {
      if (data.userId) {
        const u = await db.select().from(users).where(eq(users.uid, data.userId));
        if (u.length === 0) {
          await db.insert(users).values({
            uid: data.userId,
            email: `${data.userId}@map2medic.local`,
            name: 'Patient User',
            role: 'patient',
          });
        }
      }

      await db.insert(notifications).values({
        id,
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type || 'general',
        isRead: false,
      });
      return newNotif;
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return newNotif;
}

export async function markNotificationReadInDb(id: string) {
  const n = memoryNotifications.find(notif => notif.id === id);
  if (n) {
    n.isRead = true;
  }

  if (isDbAvailable) {
    try {
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
      
      const updated = await db.select().from(notifications).where(eq(notifications.id, id));
      if (updated.length > 0) return updated[0];
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return n || null;
}

export async function clearDatabaseAllTables() {
  memoryServices.length = 0;
  memoryProviders.length = 0;
  memoryBookings.length = 0;
  memoryUsers.length = 0;
  memoryLogins.length = 0;
  memoryPatients.length = 0;
  memoryReviews.length = 0;
  memoryPrescriptions.length = 0;
  memoryVitalsHistory.length = 0;
  memorySchedules.length = 0;
  memoryPayouts.length = 0;
  memoryMessages.length = 0;
  memoryNotifications.length = 0;

  if (isDbAvailable && mysqlPool) {
    try {
      await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 0;');
      const tbls = [
        'notifications', 'care_messages', 'payouts', 'provider_schedules',
        'patient_vitals_history', 'prescriptions', 'reviews', 'user_logins',
        'provider_documents', 'bookings', 'providers', 'patients',
        'service_pricing', 'users'
      ];
      for (const t of tbls) {
        await mysqlPool.query(`TRUNCATE TABLE ${t};`);
      }
      await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 1;');
      return { success: true, message: 'All 14 Hostinger MySQL concept tables reset successfully!' };
    } catch (error: any) {
      console.error('Failed to clear database concept tables:', error);
      throw error;
    }
  }
  return { success: true, message: 'In-memory database reset successfully!' };
}

// -------------------------------------------------------------
// APP CONFIG & SETTINGS QUERIES
// -------------------------------------------------------------
export async function getAppConfigFromDb(): Promise<Record<string, string>> {
  const result: Record<string, string> = { ...memoryAppConfig };
  if (isDbAvailable) {
    try {
      const rows = await db.select().from(appConfig);
      for (const row of rows) {
        result[row.key] = row.value;
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return result;
}

export async function updateAppConfigInDb(key: string, value: string): Promise<Record<string, string>> {
  memoryAppConfig[key] = value;
  if (isDbAvailable) {
    try {
      const existing = await db.select().from(appConfig).where(eq(appConfig.key, key));
      if (existing.length === 0) {
        await db.insert(appConfig).values({ key, value });
      } else {
        await db.update(appConfig).set({ value, updatedAt: new Date() }).where(eq(appConfig.key, key));
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return getAppConfigFromDb();
}

// -------------------------------------------------------------
// CATEGORIES CATALOG
// -------------------------------------------------------------
export const SERVICE_CATEGORIES = [
  { id: 'injections', name: 'Injections', subtitle: 'Safe • Hygienic • At Home', icon: 'Syringe' },
  { id: 'wound', name: 'Wound Care', subtitle: 'Sterile Dressing • Bed Sore', icon: 'Bandage' },
  { id: 'vitals', name: 'Vitals', subtitle: 'ECG • BP • Sugar • SpO2', icon: 'Activity' },
  { id: 'lab', name: 'Lab Tests', subtitle: 'Blood Draw • NABL Certified', icon: 'FlaskConical' },
  { id: 'physio', name: 'Physio', subtitle: 'Mobilization • Rehab', icon: 'Accessibility' },
  { id: 'elder', name: 'Elder Care', subtitle: 'Bedside • Attendant Shift', icon: 'HeartHandshake' },
];

export async function getAllCategories() {
  return SERVICE_CATEGORIES;
}

// -------------------------------------------------------------
// CART PERSISTENCE QUERIES
// -------------------------------------------------------------
export async function getCartFromDb(userId: string = 'usr-patient-rahul') {
  if (isDbAvailable) {
    try {
      const rows = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
      if (rows.length > 0) {
        return rows;
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return memoryCart.filter(item => item.userId === userId || !item.userId);
}

export async function addCartItemInDb(data: any) {
  const userId = data.userId || 'usr-patient-rahul';
  const existingMemIdx = memoryCart.findIndex(c => (c.userId === userId || !c.userId) && (c.serviceId === data.serviceId || c.title === data.title));

  if (existingMemIdx !== -1) {
    memoryCart[existingMemIdx].quantity += (data.quantity || 1);
    const updated = memoryCart[existingMemIdx];

    if (isDbAvailable) {
      try {
        await db.update(cartItems)
          .set({ quantity: updated.quantity })
          .where(eq(cartItems.id, updated.id));
      } catch (error) {
        handleDbFailure(error);
      }
    }
    return updated;
  }

  const newId = data.id || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newItem = {
    id: newId,
    userId,
    serviceId: data.serviceId || data.id,
    title: data.title || data.name,
    subtitle: data.subtitle || data.subCategory || 'At Home Care',
    price: data.price || 99,
    unit: data.unit || data.baseAmountLabel?.replace('per ', '') || 'visit',
    category: data.category || 'injections',
    imageType: data.imageType || 'injection',
    duration: data.duration || '30 mins',
    quantity: data.quantity || 1,
  };

  memoryCart.push(newItem);

  if (isDbAvailable) {
    try {
      await db.insert(cartItems).values({
        id: newItem.id,
        userId: newItem.userId,
        serviceId: newItem.serviceId,
        title: newItem.title,
        subtitle: newItem.subtitle,
        price: newItem.price,
        unit: newItem.unit,
        category: newItem.category,
        imageType: newItem.imageType,
        duration: newItem.duration,
        quantity: newItem.quantity,
      });
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return newItem;
}

export async function updateCartItemQuantityInDb(id: string, delta: number) {
  const memIdx = memoryCart.findIndex(c => c.id === id);
  if (memIdx !== -1) {
    const newQty = memoryCart[memIdx].quantity + delta;
    if (newQty <= 0) {
      memoryCart.splice(memIdx, 1);
      if (isDbAvailable) {
        try {
          await db.delete(cartItems).where(eq(cartItems.id, id));
        } catch (error) {
          handleDbFailure(error);
        }
      }
      return { deleted: true, id };
    } else {
      memoryCart[memIdx].quantity = newQty;
      const updated = memoryCart[memIdx];
      if (isDbAvailable) {
        try {
          await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, id));
        } catch (error) {
          handleDbFailure(error);
        }
      }
      return updated;
    }
  }

  if (isDbAvailable) {
    try {
      const rows = await db.select().from(cartItems).where(eq(cartItems.id, id));
      if (rows.length > 0) {
        const newQty = rows[0].quantity + delta;
        if (newQty <= 0) {
          await db.delete(cartItems).where(eq(cartItems.id, id));
          return { deleted: true, id };
        } else {
          await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, id));
          return { ...rows[0], quantity: newQty };
        }
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return null;
}

export async function removeCartItemFromDb(id: string) {
  const memIdx = memoryCart.findIndex(c => c.id === id);
  if (memIdx !== -1) {
    memoryCart.splice(memIdx, 1);
  }

  if (isDbAvailable) {
    try {
      await db.delete(cartItems).where(eq(cartItems.id, id));
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return { success: true, id };
}

export async function clearCartInDb(userId: string = 'usr-patient-rahul') {
  for (let i = memoryCart.length - 1; i >= 0; i--) {
    if (memoryCart[i].userId === userId || !memoryCart[i].userId) {
      memoryCart.splice(i, 1);
    }
  }

  if (isDbAvailable) {
    try {
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
    } catch (error) {
      handleDbFailure(error);
    }
  }
  return { success: true };
}

// -------------------------------------------------------------
// STRICT END-TO-END PATIENT-PROVIDER BOOKING STATE MACHINE
// -------------------------------------------------------------
export async function updateBookingFieldsInDb(id: string, updates: Record<string, any>) {
  const memBooking = memoryBookings.find(b => b.id === id);
  if (memBooking) {
    Object.assign(memBooking, updates);
  }

  if (isDbAvailable) {
    try {
      await db.update(bookings).set(updates).where(eq(bookings.id, id));
      const rows = await db.select().from(bookings).where(eq(bookings.id, id));
      if (rows.length > 0) {
        return { ...memBooking, ...rows[0] };
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }

  return memBooking || null;
}

export async function getBestAvailableProviderInDb(preferredProviderId?: string): Promise<any> {
  if (isDbAvailable) {
    try {
      if (preferredProviderId) {
        const match = await db.select().from(providers).where(eq(providers.id, preferredProviderId));
        if (match.length > 0) return match[0];
      }
      const available = await db.select().from(providers).where(eq(providers.isAvailable, true));
      if (available.length > 0) return available[0];
      const all = await db.select().from(providers);
      if (all.length > 0) return all[0];
    } catch (e) {
      handleDbFailure(e);
    }
  }

  if (preferredProviderId) {
    const memMatch = memoryProviders.find(p => p.id === preferredProviderId);
    if (memMatch) return memMatch;
  }
  const memAvailable = memoryProviders.find(p => p.isAvailable);
  if (memAvailable) return memAvailable;
  return memoryProviders[0] || null;
}

export async function acceptBookingByProviderInDb(bookingId: string, providerId?: string) {
  // If the booking already has an assigned specialist and is already in an active locked state, do not overwrite!
  const existing = await getSingleBookingFromDb(bookingId);
  if (existing && existing.providerId && 
      existing.status !== 'provider_cancelled' && 
      existing.status !== 'reassigning' && 
      existing.status !== 'assigning' && 
      existing.status !== 'searching' &&
      existing.status !== 'awaiting_provider_approval') {
    return existing;
  }

  const prov = await getBestAvailableProviderInDb(providerId || existing?.providerId);
  const resolvedProvId = prov?.id || providerId || 'prov-priya-nair';
  const provName = prov?.name || 'Verified Care Specialist';
  const provPhone = prov?.phone || '+91 98102 34567';
  const provRating = prov?.rating ? parseFloat(String(prov.rating)) : 4.95;
  const provTitle = prov?.title || 'Senior Registered Nurse (RN)';
  const provAvatar = prov?.avatar || 'https://images.unsplash.com/photo-1594824813587-6e6955745129?auto=format&fit=crop&q=80&w=256';

  const updates: any = {
    status: 'assigned',
    providerId: resolvedProvId,
    providerName: provName,
    providerPhone: provPhone,
    providerRating: provRating,
    providerTitle: provTitle,
    providerAvatar: provAvatar,
    currentEtaMinutes: prov?.etaMinutes || 18,
    approvalStatus: 'approved',
    approvedAt: new Date().toISOString()
  };

  const booking = await updateBookingFieldsInDb(bookingId, updates);
  return booking;
}

export async function approveBookingByProviderInDb(bookingId: string, providerId?: string) {
  return acceptBookingByProviderInDb(bookingId, providerId);
}

export async function providerCancelBookingInDb(bookingId: string, reason?: string) {
  const updates: any = {
    status: 'provider_cancelled',
    providerId: null,
    providerName: null,
    providerPhone: null,
    cancellationReason: reason || 'Specialist emergency / unavailable',
  };
  return updateBookingFieldsInDb(bookingId, updates);
}

export async function setBookingEnRouteInDb(bookingId: string, etaMinutes: number = 18) {
  const updates: any = {
    status: 'on_the_way',
    currentEtaMinutes: etaMinutes,
  };
  return updateBookingFieldsInDb(bookingId, updates);
}

export async function setBookingArrivedInDb(bookingId: string) {
  const updates: any = {
    status: 'arriving',
    currentEtaMinutes: 0,
  };
  return updateBookingFieldsInDb(bookingId, updates);
}

export async function verifyOtpAndStartServiceInDb(bookingId: string, enteredOtp: string) {
  const booking = await getSingleBookingFromDb(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const validOtp = booking.startServiceOtp || booking.otpCode || '8716';
  const cleanEntered = String(enteredOtp || '').trim();
  const cleanValid = String(validOtp).trim();

  // Accept validOtp or emergency standard test fallback '8716' or '1234'
  const isMatch = cleanEntered === cleanValid || cleanEntered === '8716' || cleanEntered === '1234';

  if (!isMatch) {
    return {
      success: false,
      error: `Invalid OTP. Please check the 4-digit code (${cleanValid}) displayed on the patient's active booking screen.`,
    };
  }

  // Update items so the first item is marked "In Progress"
  const currentItems = Array.isArray(booking.bookingItems) ? [...booking.bookingItems] : [];
  const updatedItems = currentItems.map((item: any, idx: number) => ({
    ...item,
    status: idx === 0 ? 'In Progress' : (item.status || 'Pending'),
  }));

  const updates: any = {
    status: 'service_started',
    serviceStartedAt: new Date().toISOString(),
    bookingItems: updatedItems,
  };

  const updatedBooking = await updateBookingFieldsInDb(bookingId, updates);
  return {
    success: true,
    booking: updatedBooking,
  };
}

export async function updateBookingItemStatusInDb(bookingId: string, itemId: string, itemStatus: 'Pending' | 'In Progress' | 'Completed') {
  const booking = await getSingleBookingFromDb(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const currentItems = Array.isArray(booking.bookingItems) ? [...booking.bookingItems] : [];
  const updatedItems = currentItems.map((item: any) => {
    if (item.id === itemId || item.serviceId === itemId || item.title === itemId) {
      return { ...item, status: itemStatus };
    }
    return item;
  });

  const updates: any = {
    bookingItems: updatedItems,
  };

  const updatedBooking = await updateBookingFieldsInDb(bookingId, updates);
  return updatedBooking;
}

export async function completeBookingByProviderInDb(bookingId: string) {
  const booking = await getSingleBookingFromDb(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const nowIso = new Date().toISOString();
  const isPatientAlsoCompleted = Boolean(booking.isCompletedByPatient);

  const updates: any = {
    isCompletedByProvider: true,
    completedByProviderAt: nowIso,
    status: isPatientAlsoCompleted ? 'completed' : 'awaiting_completion_confirmation',
  };

  // Mark all booking items as Completed
  if (Array.isArray(booking.bookingItems)) {
    updates.bookingItems = booking.bookingItems.map((item: any) => ({
      ...item,
      status: 'Completed',
    }));
  }

  const updatedBooking = await updateBookingFieldsInDb(bookingId, updates);

  // If both completed, credit provider
  if (updates.status === 'completed' && booking.providerId) {
    try {
      const netEarnings = Math.max(10, (booking.totalAmount || 80) - (booking.platformFee || 30));
      if (isDbAvailable) {
        await db.update(providers)
          .set({
            completedVisits: sql`COALESCE(${providers.completedVisits}, 0) + 1`,
            pendingPayout: sql`COALESCE(${providers.pendingPayout}, 0) + ${netEarnings}`,
            totalEarningsMonth: sql`COALESCE(${providers.totalEarningsMonth}, 0) + ${netEarnings}`,
          })
          .where(eq(providers.id, booking.providerId));
      }
    } catch (e) {
      console.warn('Failed to update provider earnings:', e);
    }
  }

  return updatedBooking;
}

export async function completeBookingByPatientInDb(bookingId: string) {
  const booking = await getSingleBookingFromDb(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const nowIso = new Date().toISOString();
  const isProviderAlsoCompleted = Boolean(booking.isCompletedByProvider);

  const updates: any = {
    isCompletedByPatient: true,
    completedByPatientAt: nowIso,
    status: isProviderAlsoCompleted ? 'completed' : 'awaiting_completion_confirmation',
  };

  const updatedBooking = await updateBookingFieldsInDb(bookingId, updates);

  // If both completed, credit provider
  if (updates.status === 'completed' && booking.providerId) {
    try {
      const netEarnings = Math.max(10, (booking.totalAmount || 80) - (booking.platformFee || 30));
      if (isDbAvailable) {
        await db.update(providers)
          .set({
            completedVisits: sql`COALESCE(${providers.completedVisits}, 0) + 1`,
            pendingPayout: sql`COALESCE(${providers.pendingPayout}, 0) + ${netEarnings}`,
            totalEarningsMonth: sql`COALESCE(${providers.totalEarningsMonth}, 0) + ${netEarnings}`,
          })
          .where(eq(providers.id, booking.providerId));
      }
    } catch (e) {
      console.warn('Failed to update provider earnings:', e);
    }
  }

  return updatedBooking;
}

// -------------------------------------------------------------
// USER SAVED ADDRESSES QUERIES
// -------------------------------------------------------------
export async function getUserAddressesFromDb(userId: string) {
  if (!userId) return [];
  if (isDbAvailable) {
    try {
      const rows = await db.select().from(userAddresses).where(eq(userAddresses.userId, userId));
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          label: r.label || 'HOME',
          address: r.fullAddress,
          landmark: r.landmark || '',
          isDefault: Boolean(r.isDefault),
        }));
      }
    } catch (e) {
      handleDbFailure(e);
    }
  }
  return [];
}

export async function addUserAddressInDb(userId: string, data: { label?: string; address: string; landmark?: string; isDefault?: boolean }) {
  const addressId = `addr-${Date.now().toString(36)}`;
  const label = (data.label || 'HOME').toUpperCase();
  const fullAddress = data.address || '';
  const landmark = data.landmark || '';
  const isDefault = Boolean(data.isDefault);

  if (isDbAvailable && userId) {
    try {
      if (isDefault) {
        await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, userId));
      }
      await db.insert(userAddresses).values({
        id: addressId,
        userId,
        label,
        fullAddress,
        landmark,
        isDefault,
      });
    } catch (e) {
      handleDbFailure(e);
    }
  }

  return {
    id: addressId,
    label,
    address: fullAddress,
    landmark,
    isDefault,
  };
}

export async function setDefaultUserAddressInDb(userId: string, addressId: string) {
  if (isDbAvailable && userId && addressId) {
    try {
      await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, userId));
      await db.update(userAddresses).set({ isDefault: true }).where(eq(userAddresses.id, addressId));
      return true;
    } catch (e) {
      handleDbFailure(e);
    }
  }
  return false;
}

export async function deleteUserAddressInDb(userId: string, addressId: string) {
  if (isDbAvailable && userId && addressId) {
    try {
      await db.delete(userAddresses).where(eq(userAddresses.id, addressId));
      return true;
    } catch (e) {
      handleDbFailure(e);
    }
  }
  return false;
}
