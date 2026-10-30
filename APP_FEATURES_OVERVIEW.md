# Map2Medic Health - Complete Implemented Features Overview

## 📌 Executive Summary
**Map2Medic** is a hospital-grade, on-demand home healthcare and clinical dispatch platform. It seamlessly connects patients with verified healthcare specialists (nurses, physicians, physiotherapists, phlebotomists) for sterile in-home clinical visits, medical monitoring, and urgent healthcare dispatches.

---

## 👥 1. Multi-Role Authentication & Access Governance
- **Three Core User Roles**:
  1. **Patient**: Books home healthcare visits, tracks active nurse dispatches, views clinical vitals charts, stores prescriptions, and manages emergency contact SOS alerts.
  2. **Care Provider (Clinician / Specialist)**: Manages duty availability (Online/Offline), accepts incoming home dispatches, records patient vitals during visits, uploads medical license credentials, and tracks earnings.
  3. **Medical Board Administrator**: Oversees platform dispatches, reviews and approves provider credentials, manages service pricing catalogs, and monitors database health.
- **OTP Verification Flow**: Simulates instant 4-digit SMS OTP verification (default demo code `8421`) for instant passwordless sign-in.
- **Registration & Duplicate Protection**: Full PostgreSQL registration checking duplicate email and phone number restrictions before creating accounts.
- **Date of Birth & Automatic Age Calculation**: Captures Date of Birth during registration/profile edits and automatically computes exact age in years without requiring manual age text inputs.
- **Instant Demo Switcher**: 1-click header role selector allows colleagues to easily evaluate the platform across Patient, Care Specialist, and Admin Board views.

---

## 🩺 2. Service Catalog & Intake Booking Workflow
- **Categorized Healthcare Services**:
  - *Basic Nursing Care* (Wound dressing, IV fluid administration, Foley catheter care)
  - *Clinical Procedures* (Post-surgery rehab, Pain management, Stoma & ostomy care)
  - *Post-Hospital Recovery* (Stroke rehabilitation, Intensive nurse monitoring)
  - *Elderly & Palliative Care* (Dementia care, Bedridden care, Tracheostomy care)
  - *Diagnostics & Labs* (In-home blood draw, ECG at home, Urine sample collection)
  - *Emergency Support* (24/7 Paramedic triage, Rapid nurse dispatch)
- **Flexible Appointment Scheduling**:
  - **Immediate Availability**: Instant emergency dispatch mode.
  - **Exact Date & Time Slot**: Choice of Morning Care (8AM - 12PM), Afternoon Care (12PM - 4PM), Evening Shift (4PM - 8PM), or Night Shift (8PM - 8AM).
- **Off-Hours & Night Shift Surcharge Engine**: Automatically applies off-hours surcharge calculation ($25 - $45) depending on selected care hours.
- **Comprehensive Patient Intake**:
  - Patient Name, Phone, Address, Landmark, Lift Access (Ground Floor / Elevator), Mobility Status (Ambulatory, Assisted, Bedridden), Recently Discharged status, and Emergency Contact details.
  - Generates a unique 4-digit OTP code for secure visit start verification between patient and clinician.

---

## 🔔 3. Centralized Notification & Dispatch Alerts Center
- **Header Bell Icon Counter**: Displays real-time unread notification badge with animated pulse indicator for active dispatches.
- **Notification Dropdown (`NotificationDropdown`)**:
  - Live dispatch updates (e.g., "Dispatch Confirmed: Specialist en route").
  - Clinical vitals recording alerts ("Vitals Recorded for Visit #CX-2026").
  - Emergency SOS alerts to family contacts.
  - Mark as read, mark all read, clear, and direct "View in Portal" deep-linking.

---

## 📈 4. Patient Care Portal & Clinical Charting (`PatientPortalView`)
- **Active Visits Dashboard**: Live status progress tracker (Confirmed → Specialist En Route → Arrived at Home → Treatment In Progress → Visit Completed).
- **Per-Visit Database Sync**: Individual "Sync Visit" button to refresh real-time status directly from PostgreSQL database.
- **Clinical Vitals & Historical Chart (`VitalsTrendChart`)**: Plots recorded Blood Pressure (Systolic/Diastolic), Pulse Rate, Oxygen Saturation (SpO2), and Body Temperature over time.
- **Prescriptions & Lab Slips Vault**: Secure digital archive of signed prescriptions and diagnostic reports.
- **Emergency SOS & Contact Manager**: One-click SMS dispatch alert trigger to emergency contacts.

---

## 🩺 5. Care Provider / Specialist Hub (`ProviderPortalView`)
- **Duty Availability Switcher**: 1-click toggle for Online/Offline status with instant PostgreSQL persistence.
- **Active Jobs & Dispatches Queue**: View patient intake details, address map landmark, lift availability, and contact numbers.
- **In-Visit Clinical Vitals Recorder**:
  - Record Systolic/Diastolic BP, Pulse Rate (bpm), Oxygen Level (% SpO2), Temperature (°F), Random Blood Sugar (mg/dL), and Nurse Procedure Notes.
  - Marks checklist items (Vitals Checked, Medication Administered, Sterile Dressing Completed).
- **Credential Document Uploader**: Upload State Medical License, Nursing Registration, and Identity Verification documents (`.pdf`, `.jpg`, `.png`).
- **Earnings & Payout Cashout**: Real-time tracking of pending payout and monthly earnings with instant bank transfer request.

---

## 🛡️ 6. Medical Governance & Admin Review (`AdminPortalView`)
- **Platform KPI Counter Cards**: Total catalog services, active registered providers, available online specialists, total bookings, active dispatches, completed visits, total revenue, and verified documents.
- **Provider Credential Approval System**:
  - Review submitted medical licenses and credentials.
  - 1-click "Approve Document" or "Reject Credential" with custom rejection feedback reason.
- **Healthcare Catalog Pricing Manager**:
  - Update base service prices with instant PostgreSQL update.
  - Add new clinical services or remove obsolete procedures.
- **Database Maintenance Panel**: Clean database reset for fresh demo evaluation.

---

## ⚡ 7. Real-Time Synchronization & Technical Stack
- **Frontend Framework**: React 18 + TypeScript + Vite + Tailwind CSS.
- **Backend Architecture**: Express Node server (`server.ts`) proxying Drizzle ORM queries to PostgreSQL database.
- **Cross-Tab Real-Time Sync**: Utilizes HTML5 `BroadcastChannel` and `localStorage` events (`REFRESH_ALL`, `BOOKING_STATUS_CHANGED`) so changes in Provider view immediately update Patient view across tabs.
- **PWA Capabilities**: PWA Service Worker (`sw.js`), Web App Manifest (`manifest.json`), offline indicator, and Android/iOS install prompt.
