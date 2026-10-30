# Map2Medic — Rapid Clinical Care at Home

Map2Medic is a premier home healthcare platform providing 15–30 minute doorstep dispatch for certified nurses, medics, and physiotherapists with 100% sterile procedural kits.

## Developer & AI Studio Guidelines
All contributors, developers, and AI coding assistants working on this application must strictly follow the project's engineering, architectural, and UX constitution documented in:

👉 **[`MAP2MEDIC_GUIDELINES.md`](./MAP2MEDIC_GUIDELINES.md)**

### Key Highlights
* **Theme**: Dark-teal gradient (`#073b34` / `#052e28` / `#041f1b`), glassmorphic cards (`bg-white/10 border-teal-400/20`), vibrant emerald CTAs (`#10b981`).
* **Unauthenticated Flow**: `SplashScreen` (Logo ~2s) → `AuthScreen` (Compact zero-scroll Login) → `RoleSelectionScreen` (Patient vs. Nurse) → `SignUpFormScreen` (Dedicated single form) → Redirect to **My Profile**.
* **Authenticated Flow**: Directly lands on **Services (Home)** dashboard (`/home`).
* **GPS & Location**: Precision hardware GPS with OpenStreetMap Nominatim reverse geocoding & live autocomplete search (zero fake mock coordinates).
* **Provider Matching**: Provider locking throughout visit lifecycle (`assigned`/`confirmed` → `on_the_way` → `arrived` → `service_started` → `completed`).

## Tech Stack
* **Framework**: React SPA (Vite)
* **Styling**: Tailwind CSS (`@import "tailwindcss";`)
* **Backend Proxy & Database**: Express server (`server.ts`) with Hostinger MySQL / Cloud SQL & memory fallback
* **Type Safety**: TypeScript (`tsc --noEmit`)
