import { mysqlTable, serial, varchar, text, int, boolean, datetime, json } from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

// 1. User Account Concept (Users table)
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Auth UID
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 100 }),
  role: varchar('role', { length: 50 }).default('patient').notNull(), // 'patient' | 'provider' | 'admin'
  address: text('address'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 2. User Login Session Concept (Logins table)
export const userLogins = mysqlTable('user_logins', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  loginAt: datetime('login_at').default(sql`CURRENT_TIMESTAMP`),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  status: varchar('status', { length: 50 }).default('success').notNull(),
});

// 3. Patient Concept (Patients table)
export const patients = mysqlTable('patients', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  age: int('age').default(35),
  gender: varchar('gender', { length: 50 }),
  phone: varchar('phone', { length: 100 }),
  address: text('address'),
  landmark: varchar('landmark', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 100 }),
  mobilityStatus: varchar('mobility_status', { length: 100 }),
  recentlyDischarged: varchar('recently_discharged', { length: 100 }),
  medicalNotes: text('medical_notes'),
  bloodGroup: varchar('blood_group', { length: 20 }),
  allergies: text('allergies'),
  dateOfBirth: varchar('date_of_birth', { length: 50 }),
  insuranceProvider: varchar('insurance_provider', { length: 255 }),
  insurancePolicyNumber: varchar('insurance_policy_number', { length: 100 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 3b. User Saved Addresses Concept
export const userAddresses = mysqlTable('user_addresses', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  label: varchar('label', { length: 50 }).default('HOME').notNull(), // 'HOME' | 'WORK' | 'OTHER'
  fullAddress: text('full_address').notNull(),
  landmark: varchar('landmark', { length: 255 }),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 4. Healthcare Provider Concept (Providers table)
export const providers = mysqlTable('providers', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  avatar: text('avatar'),
  rating: varchar('rating', { length: 20 }).default('5.0'),
  reviewCount: int('review_count').default(0),
  experienceYears: int('experience_years').default(1),
  distanceKm: varchar('distance_km', { length: 20 }).default('2.0'),
  etaMinutes: int('eta_minutes').default(20),
  isAvailable: boolean('is_available').default(true),
  currentLocationName: varchar('current_location_name', { length: 255 }).default('Metro District'),
  badges: json('badges'),
  hourlyRate: int('hourly_rate').default(50),
  completedVisits: int('completed_visits').default(0),
  phone: varchar('phone', { length: 100 }),
  email: varchar('email', { length: 255 }),
  bio: text('bio'),
  dateOfBirth: varchar('date_of_birth', { length: 50 }),
  age: int('age').default(35),
  pendingPayout: int('pending_payout').default(0),
  totalEarningsMonth: int('total_earnings_month').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 5. Service Pricing Concept (Pricing Catalog table)
export const servicePricing = mysqlTable('service_pricing', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subCategory: varchar('sub_category', { length: 100 }),
  price: int('price').notNull(),
  baseAmountLabel: varchar('base_amount_label', { length: 100 }).notNull(),
  duration: varchar('duration', { length: 100 }).notNull(),
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  description: text('description').notNull(),
  includes: json('includes'),
  popular: boolean('popular').default(false),
  requiresPrescription: boolean('requires_prescription').default(false),
  priority: varchar('priority', { length: 50 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 6. Booking Concept (Bookings table)
export const bookings = mysqlTable('bookings', {
  id: varchar('id', { length: 255 }).primaryKey(), // e.g. "CX-2026-4821"
  patientId: varchar('patient_id', { length: 255 }).references(() => users.uid, { onDelete: 'set null' }),
  serviceId: varchar('service_id', { length: 255 }).references(() => servicePricing.id, { onDelete: 'set null' }),
  providerId: varchar('provider_id', { length: 255 }).references(() => providers.id, { onDelete: 'set null' }),
  patientName: varchar('patient_name', { length: 255 }),
  patientAge: int('patient_age'),
  patientGender: varchar('patient_gender', { length: 50 }),
  patientPhone: varchar('patient_phone', { length: 100 }),
  patientAddress: text('patient_address'),
  landmark: varchar('landmark', { length: 255 }),
  liftAvailability: varchar('lift_availability', { length: 100 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 100 }),
  mobilityStatus: varchar('mobility_status', { length: 100 }),
  recentlyDischarged: varchar('recently_discharged', { length: 100 }),
  serviceName: varchar('service_name', { length: 255 }),
  providerName: varchar('provider_name', { length: 255 }),
  providerPhone: varchar('provider_phone', { length: 100 }),
  date: varchar('date', { length: 100 }).notNull(),
  timeSlot: varchar('time_slot', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('confirmed').notNull(),
  basePrice: int('base_price').notNull(),
  addons: json('addons'),
  platformFee: int('platform_fee').default(5).notNull(),
  discount: int('discount').default(0).notNull(),
  totalAmount: int('total_amount').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('card').notNull(),
  paymentStatus: varchar('payment_status', { length: 50 }).default('paid').notNull(),
  medicalNotes: text('medical_notes'),
  vitalsRecorded: json('vitals_recorded'),
  intakeIntent: varchar('intake_intent', { length: 255 }),
  careDuration: varchar('care_duration', { length: 100 }),
  otpCode: varchar('otp_code', { length: 20 }),
  startServiceOtp: varchar('start_service_otp', { length: 20 }),
  isCompletedByProvider: boolean('is_completed_by_provider').default(false),
  completedByProviderAt: varchar('completed_by_provider_at', { length: 100 }),
  isCompletedByPatient: boolean('is_completed_by_patient').default(false),
  completedByPatientAt: varchar('completed_by_patient_at', { length: 100 }),
  serviceStartedAt: varchar('service_started_at', { length: 100 }),
  currentEtaMinutes: int('current_eta_minutes').default(18),
  bookingItems: json('booking_items'),
  progressChecklist: json('progress_checklist'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 6b. Cart Items Concept (Cart persistence in DB)
export const cartItems = mysqlTable('cart_items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).default('usr-patient').notNull(),
  serviceId: varchar('service_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }),
  price: int('price').notNull(),
  unit: varchar('unit', { length: 50 }).default('visit'),
  category: varchar('category', { length: 100 }).default('injections'),
  imageType: varchar('image_type', { length: 100 }).default('injection'),
  duration: varchar('duration', { length: 100 }).default('30 mins'),
  quantity: int('quantity').default(1).notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 6c. App Configuration & Settings Concept
export const appConfig = mysqlTable('app_config', {
  key: varchar('config_key', { length: 100 }).primaryKey(),
  value: text('config_value').notNull(),
  description: varchar('description', { length: 255 }),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 7. Provider / Patient Documents Concept
export const providerDocuments = mysqlTable('provider_documents', {
  id: varchar('id', { length: 255 }).primaryKey(),
  providerId: varchar('provider_id', { length: 255 }).references(() => providers.id, { onDelete: 'cascade' }),
  patientId: varchar('patient_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }),
  docType: varchar('doc_type', { length: 100 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  uploadedAt: varchar('uploaded_at', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending_review').notNull(), // 'verified' | 'pending_review' | 'rejected'
  rejectionReason: text('rejection_reason'),
  expiryDate: varchar('expiry_date', { length: 100 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 8. Reviews Concept (Ratings & Patient Feedback)
export const reviews = mysqlTable('reviews', {
  id: varchar('id', { length: 255 }).primaryKey(),
  bookingId: varchar('booking_id', { length: 255 }).references(() => bookings.id, { onDelete: 'cascade' }),
  patientId: varchar('patient_id', { length: 255 }).references(() => users.uid, { onDelete: 'set null' }),
  providerId: varchar('provider_id', { length: 255 }).references(() => providers.id, { onDelete: 'cascade' }).notNull(),
  rating: int('rating').notNull(), // 1 to 5
  comment: text('comment'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 9. Prescriptions Concept (E-Prescriptions & Care Directives)
export const prescriptions = mysqlTable('prescriptions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  bookingId: varchar('booking_id', { length: 255 }).references(() => bookings.id, { onDelete: 'set null' }),
  patientId: varchar('patient_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).references(() => providers.id, { onDelete: 'set null' }),
  medicationName: varchar('medication_name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }).notNull(),
  frequency: varchar('frequency', { length: 100 }).notNull(),
  instructions: text('instructions'),
  durationDays: int('duration_days').default(7),
  issuedAt: datetime('issued_at').default(sql`CURRENT_TIMESTAMP`),
});

// 10. Patient Vitals History Concept (Longitudinal Health Tracking)
export const patientVitalsHistory = mysqlTable('patient_vitals_history', {
  id: varchar('id', { length: 255 }).primaryKey(),
  patientId: varchar('patient_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  bookingId: varchar('booking_id', { length: 255 }).references(() => bookings.id, { onDelete: 'set null' }),
  bloodPressureSys: int('blood_pressure_sys'),
  bloodPressureDia: int('blood_pressure_dia'),
  heartRate: int('heart_rate'),
  temperatureC: varchar('temperature_c', { length: 50 }),
  spo2: int('spo2'),
  glucoseMgDl: int('glucose_mg_dl'),
  notes: text('notes'),
  recordedAt: datetime('recorded_at').default(sql`CURRENT_TIMESTAMP`),
});

// 11. Provider Schedule & Shift Availability Concept
export const providerSchedules = mysqlTable('provider_schedules', {
  id: varchar('id', { length: 255 }).primaryKey(),
  providerId: varchar('provider_id', { length: 255 }).references(() => providers.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: int('day_of_week').notNull(), // 0 = Sun, 1 = Mon...
  startTime: varchar('start_time', { length: 50 }).notNull(), // "08:00"
  endTime: varchar('end_time', { length: 50 }).notNull(), // "17:00"
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 12. Payouts & Earnings Settlement Concept
export const payouts = mysqlTable('payouts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  providerId: varchar('provider_id', { length: 255 }).references(() => providers.id, { onDelete: 'cascade' }).notNull(),
  amount: int('amount').notNull(),
  status: varchar('status', { length: 50 }).default('completed').notNull(), // 'pending' | 'processing' | 'completed' | 'failed'
  payoutMethod: varchar('payout_method', { length: 100 }).default('direct_deposit').notNull(),
  payoutDate: datetime('payout_date').default(sql`CURRENT_TIMESTAMP`),
  transactionRef: varchar('transaction_ref', { length: 255 }),
});

// 13. Care Messages Concept (Direct Patient-Provider Messaging)
export const careMessages = mysqlTable('care_messages', {
  id: varchar('id', { length: 255 }).primaryKey(),
  bookingId: varchar('booking_id', { length: 255 }).references(() => bookings.id, { onDelete: 'cascade' }),
  senderId: varchar('sender_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  receiverId: varchar('receiver_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 14. Notifications & Dispatch Alerts Concept
export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  type: varchar('type', { length: 50 }).default('general').notNull(), // 'booking' | 'prescription' | 'vitals' | 'system'
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Drizzle Schema Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  bookings: many(bookings),
  logins: many(userLogins),
  reviews: many(reviews),
  prescriptions: many(prescriptions),
  vitalsHistory: many(patientVitalsHistory),
  notifications: many(notifications),
  sentMessages: many(careMessages, { relationName: 'sentMessages' }),
  receivedMessages: many(careMessages, { relationName: 'receivedMessages' }),
  patientProfile: one(patients, {
    fields: [users.uid],
    references: [patients.userId],
  }),
  providerProfile: one(providers, {
    fields: [users.uid],
    references: [providers.userId],
  }),
}));

export const userLoginsRelations = relations(userLogins, ({ one }) => ({
  user: one(users, {
    fields: [userLogins.userId],
    references: [users.uid],
  }),
}));

export const patientsRelations = relations(patients, ({ one }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.uid],
  }),
}));

export const providersRelations = relations(providers, ({ many, one }) => ({
  user: one(users, {
    fields: [providers.userId],
    references: [users.uid],
  }),
  documents: many(providerDocuments),
  bookings: many(bookings),
  reviews: many(reviews),
  prescriptions: many(prescriptions),
  schedules: many(providerSchedules),
  payouts: many(payouts),
}));

export const providerDocumentsRelations = relations(providerDocuments, ({ one }) => ({
  provider: one(providers, {
    fields: [providerDocuments.providerId],
    references: [providers.id],
  }),
  patient: one(users, {
    fields: [providerDocuments.patientId],
    references: [users.uid],
  }),
}));

export const servicePricingRelations = relations(servicePricing, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  patient: one(users, {
    fields: [bookings.patientId],
    references: [users.uid],
  }),
  provider: one(providers, {
    fields: [bookings.providerId],
    references: [providers.id],
  }),
  service: one(servicePricing, {
    fields: [bookings.serviceId],
    references: [servicePricing.id],
  }),
  reviews: many(reviews),
  prescriptions: many(prescriptions),
  vitals: many(patientVitalsHistory),
  messages: many(careMessages),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  patient: one(users, {
    fields: [reviews.patientId],
    references: [users.uid],
  }),
  provider: one(providers, {
    fields: [reviews.providerId],
    references: [providers.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  booking: one(bookings, {
    fields: [prescriptions.bookingId],
    references: [bookings.id],
  }),
  patient: one(users, {
    fields: [prescriptions.patientId],
    references: [users.uid],
  }),
  provider: one(providers, {
    fields: [prescriptions.providerId],
    references: [providers.id],
  }),
}));

export const patientVitalsHistoryRelations = relations(patientVitalsHistory, ({ one }) => ({
  patient: one(users, {
    fields: [patientVitalsHistory.patientId],
    references: [users.uid],
  }),
  booking: one(bookings, {
    fields: [patientVitalsHistory.bookingId],
    references: [bookings.id],
  }),
}));

export const providerSchedulesRelations = relations(providerSchedules, ({ one }) => ({
  provider: one(providers, {
    fields: [providerSchedules.providerId],
    references: [providers.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  provider: one(providers, {
    fields: [payouts.providerId],
    references: [providers.id],
  }),
}));

export const careMessagesRelations = relations(careMessages, ({ one }) => ({
  booking: one(bookings, {
    fields: [careMessages.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    relationName: 'sentMessages',
    fields: [careMessages.senderId],
    references: [users.uid],
  }),
  receiver: one(users, {
    relationName: 'receivedMessages',
    fields: [careMessages.receiverId],
    references: [users.uid],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.uid],
  }),
}));
