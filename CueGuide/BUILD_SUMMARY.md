# CueGuide Mobile Port Readiness Summary

> Status: mobile is a port target, not the production source of truth. The root web app at `https://cueguide-web.vercel.app` remains the release surface until the mobile app has the same medication/session loop, voice boundary, data proof, and store compliance evidence.

## Current Release Surface

### Web App

- **Live URL:** https://cueguide-web.vercel.app
- **Role:** stakeholder alpha and product source of truth.
- **Core loop:** caregiver medication setup -> patient Focus Mode -> Help/Skip/Done -> caregiver alerts/reports.
- **Voice:** ElevenLabs is server-side only through `/api/elevenlabs/*`.

### Mobile App

- **Role:** later iOS/Android port target.
- **Android package:** `com.cueguide.app`.
- **iOS bundle:** `com.cueguide.app`.
- **EAS profiles:** development, preview, production.
- **Not store-ready yet:** native UX parity, real-device QA, privacy labels, health-data disclosures, TestFlight/internal track evidence, and release signing are still pending.

---

## Existing Mobile Capabilities

### Phase 1: Mobile Foundation
- React Native (Expo) mobile app
- Caregiver Dashboard with routines, stats, schedule adjustments
- Patient Focus Mode - full-screen, large text (32px), step-by-step
- Tab navigation
- Zustand stores with AsyncStorage persistence

### Phase 2: Voice & AI (OpenRouter)
- AI generation should call the root web/API proxy; provider secrets must never use `EXPO_PUBLIC_*`.
- Mobile uses `EXPO_PUBLIC_CUEGUIDE_API_BASE_URL` to reach the CueGuide backend.
- ElevenLabs TTS + expo-speech fallback
- '🔊 Read aloud' button on each step
- Gentle voice settings for dementia patients

### Phase 3: Medication Tracking
- Medication store with CRUD operations
- Today's schedule by time slots
- Pill color visualization
- Active/inactive toggle
- Refill reminders

### Phase 4: Supabase Backend
- Supabase project connected
- Database tables: patients, routines, completions, medications
- RLS policies for data isolation
- Real-time subscriptions
- Works offline-first (local + sync ready)

### Phase 5: Health Integration Scaffold
- Health store with metrics (steps, sleep, heart rate)
- HealthScreen with today's summary
- Weekly activity chart
- Health-Routine correlation insights
- Apple Health / Samsung Health integration scaffolding
- Store requirement: ship only after clear consent, privacy disclosures, and proof that unused health/camera/microphone permissions are removed.

### Phase 6: Production Polish
- **404 page** with navigation back
- **ErrorFallback** component with retry + home
- **LoadingSpinner** and **SkeletonCard** components
- **SyncStatus** component (online/offline indicator)
- **ManagementPanel** (session/chat/history viewer)
- **Session/Chat/History stores** with persistence
- **DataSync service** for Supabase synchronization
- **Auth store** with proper loading states
- **Route guard** for protected pages

### Web-Only Features
- Command Palette (⌘K) global search
- PDF Report generation (jsPDF)
- Weekly analytics charts (Recharts)
- PHI compliance visualization
- Device manager UI
- Anonymization pipeline visualizer
- AI routine generation with drag-drop steps
- AI scheduling suggestions

---

## 📊 Build Metrics

| Metric | Value |
|--------|-------|
| Web build | ~1.2MB JS (345KB gzip), 68KB CSS |
| Android APK | 69MB |
| TypeScript modules | ~3390 transformed |
| Playwright tests | 7/7 pass |

---

## Store-Readiness Blockers

| Task | Requirement |
|------|-------------|
| Web loop accepted | Human-ear ElevenLabs review and Supabase cloud proof. |
| iOS build | Apple Developer account, signing, provisioning, TestFlight. |
| Android build | Play Console account, release signing, internal testing track. |
| Native UX parity | Port root web medication/session model into Expo and remove stale demo screens. |
| Voice/AI boundary | Mobile must call `/api/elevenlabs/*` and `/api/ai/cue`; no public provider keys. |
| Health permissions | Keep HealthKit/Health Connect off unless the feature is real, consented, and disclosed. |
| Privacy labels | App Store privacy details, Google Play Data safety, health app declaration, account deletion flow. |
| Push notifications | Real notification provider, permission copy, quiet hours, and delivery QA. |
| Monitoring | Sentry or equivalent project created for CueGuide web/native releases. |
| Beta evidence | Real caregiver/patient-device testing, crash logs, and store screenshots. |

## Hard Rules For The Mobile Port

- Copy the proven root web product loop, not the older mobile UX wholesale.
- Keep Som's voice standard: human, soft, gentle, and question-shaped.
- Never claim `Done` proves medication was swallowed.
- Do not expose ElevenLabs, OpenRouter, Gemini, Twilio auth, or service-role keys in Expo public env.
- Remove unused permissions before store submission.
