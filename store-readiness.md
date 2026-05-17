---
aliases: [store-readiness, app-store-readiness, mobile-release]
tags: [project, mobile, app-store, android, compliance, release]
created: 2026-05-17
updated: 2026-05-17
---

# CueGuide Store Readiness

> [!note]
> This is the mobile release map for [[dashboard|CueGuide]]. It links [[plans]], [[runbook]], [[qa-log]], [[source-map]], and the nested [[CueGuide/BUILD_SUMMARY|Expo app]] so store work does not drift from the Som medication/voice loop.

## Current Truth

CueGuide is **not App Store or Google Play ready today**. The web app is the source of truth and can be shown as a stakeholder alpha. The nested Expo app is a port target that needs parity, real-device QA, signing, store metadata, privacy declarations, and health-data cleanup before submission.

## Store-Critical Requirements

| Area | Apple / Google expectation | CueGuide implication |
| --- | --- | --- |
| Healthcare identity | Apple says highly regulated healthcare apps should be submitted by a legal entity that provides the services. | Submit under the correct company/developer identity before claiming healthcare production readiness. |
| Health data privacy | Apple requires App Privacy details and specific disclosure of health data collection; HealthKit data cannot be used for advertising or misleading purposes. | Keep medication and health-data collection minimal, disclosed, and caregiver-consented. Do not store PHI in iCloud. |
| Google Play health apps | Google Play health apps must complete the health apps declaration and disclose purpose, benefits, risks, users, and disclaimers when making health/medical claims. | CueGuide needs an in-app disclaimer and public privacy policy that match the actual product. |
| Android permissions | Google flags health-related sensitive permissions and says unused permissions should be removed. | Remove camera/microphone/health permissions unless the native feature is real and tested. |
| Provider secrets | Expo public env values are bundled into the client. | Mobile may expose only non-secret config such as `EXPO_PUBLIC_CUEGUIDE_API_BASE_URL`; provider keys stay server-side. |
| Voice quality | Som's transcript/email standard is human, soft, gentle, and asking rather than commanding. | ElevenLabs must be mandatory for release-grade voice; browser/native TTS is fallback only. |
| Medication confirmation | Som asked how the app knows medication was administered. | `Done` means patient confirmation in CueGuide, not physical proof of swallowing. Store copy must avoid stronger claims. |

## Before TestFlight / Internal Track

- Port the root web medication/session model into Expo.
- Remove stale mobile screens that do not serve the caregiver medication loop.
- Verify no `EXPO_PUBLIC_*` provider secret names exist in tracked files or local env.
- Run native smoke on a real iPhone and Android device:
  - create caregiver account or local setup
  - add medication with dose, pill color/shape, time, location, refill
  - start patient Focus Mode
  - play ElevenLabs through backend proxy
  - Help, Skip, Done, mood
  - caregiver alert/session/report update
- Verify push notification permission copy and quiet-hours behavior.
- Verify app works without health permissions.
- Add Sentry or equivalent crash monitoring for web and native.

## Before Public Store Submission

- Apple Developer Program and Google Play Console accounts confirmed under the correct entity.
- App Store privacy details and Google Play Data safety answers match actual collection/sharing.
- Health apps declaration completed in Play Console.
- Privacy policy and terms are public, non-placeholder, and linked in-app.
- Account deletion path exists if cloud accounts are enabled.
- Supabase cloud proof passes with a normal caregiver account through RLS.
- Human voice acceptance is recorded in [[qa-log]].
- Beta evidence from real caregiver/patient-device use is recorded.

## Sources

- Apple App Review Guidelines, including healthcare identity, data use, and HealthKit rules: https://developer.apple.com/app-store/review/guidelines/
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Google Play health app declaration and health-data disclosures: https://support.google.com/googleplay/android-developer/answer/13996367
- Google Play health content and services policy preview effective January 28, 2026: https://support.google.com/googleplay/android-developer/answer/16555673
- Alzheimer's Association 2026 facts and figures: https://www.alz.org/alzheimers-dementia/facts-figures
- AARP medication management caregiver guide: https://www.aarp.org/caregiving/medical/medication-management/

Linked: [[plans#4. Mobile Port]], [[runbook#Supabase Verification]], [[source-map#Som Feedback]], [[todo#P3 - Mobile Port Prep]]
