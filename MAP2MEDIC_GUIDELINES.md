# Map2Medic — Architectural, Technical & UX Guidelines

> **Strict Engineering & Design Constitution**  
> All developers, AI coding assistants, and contributors must strictly adhere to these rules when adding features, refactoring code, or fixing bugs in the **Map2Medic** codebase.

---

## 1. Product Purpose & Brand Identity
* **Core Value Proposition**: Rapid clinical care at home—delivering certified nurses, medics, and physiotherapists to the patient's doorstep in 15–30 minutes with 100% sterile procedural kits.
* **Clinical Trust & Visual Standard**:
  * Clean, modern, medical-grade UI widgets (no cartoonish placeholders or generic clip-art).
  * High-trust status badges (e.g., `Certified M.D.`, `Cold-Chain 2-8°C`, `Sterile Kit`, `NABL Lab Kit`).
  * Seamless imagery with transparent/blended overlays (no visible white borders or uncropped background strips).

---

## 2. Design System & Theme Constitution

### Color Palette
* **Signature Background**: Dark-teal vertical gradient across onboarding and header cards:
  ```css
  bg-gradient-to-b from-[#073b34] via-[#052e28] to-[#041f1b]
  ```
* **Glassmorphic Card Surfaces**:
  ```css
  bg-white/10 hover:bg-white/15 border border-teal-400/20 backdrop-blur-md text-white
  ```
* **Primary Action Buttons & Accents**: Vibrant emerald/mint green:
  ```css
  bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold
  ```
* **Subtitles & Secondary Text**: Soft mint-teal:
  ```css
  text-teal-200/80 font-medium
  ```

### Navigation & Layout Discipline
* **Fixed Bottom Thumb-Zone Navigation**:
  * Bottom navigation bar (`Home (Services)`, `Cart`, `Orders`, `My Profile`) is strictly fixed (`sticky/fixed; bottom: 0`).
  * Navigation bar is **completely hidden** during unauthenticated onboarding screens (`SplashScreen`, `AuthScreen`, `RoleSelectionScreen`, `SignUpFormScreen`).
* **Zero-Scroll Viewport Lock on Login (`AuthScreen`)**:
  * Container is locked to `h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between px-5 py-4`.
  * All elements—from the top Map2Medic logo down to the bottom "Sign Up" toggle—must fit on a single viewport without requiring any vertical scrolling.
* **Silent Navigation Discipline**:
  * Do NOT trigger intrusive toast pop-ups or banner overlays during auth transitions, sign-ups, or role switching.
  * Transitions must be silent, clean, and instant.

---

## 3. Authentication & Entry Sequence Flow

```
[ Unauthenticated App Launch ]
       │
       ▼
1. SplashScreen (Logo Page ~2s / tap)
       │
       ▼
2. AuthScreen (Compact Single-Viewport Login)
       │
       ├─────────────────────────────────────────┐
       ▼ (Existing User Login)                   ▼ (New User Sign-Up)
Main Services Dashboard (`/home`)          3. RoleSelectionScreen (Patient vs. Nurse)
                                                 │
                                                 ▼
                                           4. SignUpFormScreen (Dedicated Role Form)
                                                 │
                                                 ▼
                                           Direct Redirect to "My Profile" (`/profile`)
```

### Unauthenticated Sequence
1. **SplashScreen**: Centered glowing Map2Medic logo (full aspect ratio, `object-contain`, no square boundary box) + bottom nurse hero graphic with smooth gradient fade. Auto-transitions in ~2 seconds.
2. **AuthScreen**:
   * Header text: Concise `"Login to access"` directly below the brand title (no multi-line paragraphs).
   * Form inputs: Initialize as **completely empty strings (`""`)** (no hardcoded demo numbers or pre-filled passwords).
   * OTP mode: Includes a 4-digit SMS OTP option (`4829`) alongside password login.
3. **RoleSelectionScreen**:
   * Clean header with top-left back button (no step-counter headers like "Step 3 of 3").
   * **Strictly 2 Role Cards**:
     * `"I am a Patient"` (*Book nurse & paramedic services*)
     * `"I am a Nurse"` (*Provide nursing services*)
4. **SignUpFormScreen**:
   * Renders **exclusively** the single registration form corresponding to the chosen role (no tabs, toggles, or secondary switches).
5. **Post-Registration Redirect**:
   * Newly registered users land directly on **My Profile** (`patient-portal` for Patients, `provider-portal` for Nurses).
   * Returning logged-in users land directly on **Services (Home)** (`/home`).

### Authenticated Sequence (`carex_is_logged_in === 'true'`)
* Bypasses Splash, Login, and Role Selection screens completely and lands directly on **Services (Home)**.

---

## 4. Clinical Care, Cart & Checkout Workflow

1. **Service Card "+ ADD" Button**:
   * Clicking "+ ADD" transitions the button state directly to `"Added ✓"` without replacing it with a quantity stepper (`- 1 +`).
   * Service removal/quantity adjustment is managed inside the Cart screen.
2. **Clinical Compliance (`Rx` Prescription Check)**:
   * Services requiring a prescription (Injections, IV Drips) render a Clinical Compliance block in Cart with two options:
     * *Option A*: File/camera prescription upload.
     * *Option B*: Checkbox: `[x] I have a valid doctor's prescription & prescribed medicine ready at home`.
3. **Family Care ("Who is this visit for?")**:
   * Quick chip selector (`Myself` | `Parent / Family Member`).
   * When `Parent / Family Member` is selected, renders inline fields for `Patient Name` and `Age`.
4. **Single Plus Icon**:
   * Buttons labeled "Add More Services" must render with a single `+` icon (never duplicate `+ + Add More Services`).
5. **Conditional Empty Cart State**:
   * If `cart.length === 0`, display a clean "Your Cart is Empty" card and **completely hide** the Care Assignment section, Subtotal, Taxes, and Bill Breakdown.

---

## 5. GPS Address Precision & Provider Locking

### GPS & Location Lookup
1. **Hardware GPS First**: Call `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }`.
2. **Nominatim Reverse Geocoding**: Pass lat/lon to OpenStreetMap Nominatim reverse geocoding (`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`).
   * Map `road`, `suburb/neighbourhood`, `city/state_district`, and `postcode` directly into address form fields.
   * **Zero Mock/IP Fallback Data**: Never auto-fill fake server coordinates or hardcoded fallback cities.
3. **Interactive Nominatim Search**: Include a live search/autocomplete input above the fields so users can search sector/society names and auto-fill in 1 tap.

### Provider Assignment Locking
* **Lifecycle Lock**: Once a practitioner is matched/assigned (`assigned` / `confirmed` → `on_the_way` → `arrived` → `service_started` → `completed`), lock the `providerId`.
* **Reassignment Protection**: Re-running provider matching or `useEffect` timeouts on navigation/re-renders is strictly prohibited unless `booking.status === 'provider_cancelled'`.

---

## 6. Code Standards & File Structure

```
src/
├── components/
│   ├── onboarding/
│   │   ├── SplashScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── RoleSelectionScreen.tsx
│   │   ├── SignUpFormScreen.tsx
│   │   └── OnboardingContainer.tsx
│   ├── flow/
│   │   ├── Screen1Home.tsx
│   │   ├── Screen2Cart.tsx
│   │   ├── Screen3Assignment.tsx
│   │   ├── Screen4Tracking.tsx
│   │   ├── Screen5ServiceStarted.tsx
│   │   └── Modals.tsx
│   ├── views/
│   │   ├── PatientPortalView.tsx
│   │   └── ProviderPortalView.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── context/
│   └── CareXContext.tsx
└── types/
    └── carex.ts
```

* **TypeScript Discipline**: Every build must pass `tsc --noEmit` with 0 type errors before deploying or committing.
* **State Persistence**: Store session state using `localStorage` keys (`carex_is_logged_in`, `carex_active_role`, `carex_patient_user`, `carex_saved_addresses`).
