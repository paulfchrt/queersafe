# QueerSafe

**LGBTQ+ safety and meeting planning.** This repository contains two distinct projects:

- **Native mobile app:** `mobile/` — React Native + Expo for iOS and Android, with the Pride Q+ identity.
- **Web prototype:** static app at the repository root, retained as a temporary concept/demo.

## Mobile app setup

Read [the mobile README](mobile/README.md) and [the security checklist](mobile/SECURITY_CHECKLIST.md). The initial database migration is in `supabase/migrations/`.

The native app currently includes a mobile navigation shell, meeting-plan sharing, local trusted-contact selection/storage, and explicit user-triggered shortcuts to SMS or phone calls. The app asks for location only when composing an SOS SMS.

## What is not live yet

- Supabase client and email signup/login are implemented in the mobile app, but live authentication and database access still need to be tested against the configured Supabase project.
- No community SOS is transmitted to other QueerSafe users.
- No verified place directory has been populated.
- No push notifications, moderation console, or server-side alert expiry are configured.
- No iOS/Android binary has been built, signed, or submitted to a store.
- The code has not yet passed a full device test or independent security review.

**Do not rely on QueerSafe as an emergency service.** The SOS shortcuts require user confirmation and cannot guarantee delivery or response. Call local emergency services directly in immediate danger.

## Suggested implementation order

1. Install and type-check the native project; fix build issues.
2. Create a Supabase project, apply the migration, and test Row Level Security.
3. Test email authentication and RLS; then add place submission/moderation and a privacy policy.
4. Build an audited server-side alert workflow with expiration, abuse controls and push notifications.
5. Run closed beta tests on iOS and Android, including offline and denied-permission cases.
6. Prepare store metadata, legal pages and release builds.

## Web prototype

The web prototype remains available through GitHub Pages. It is not the native app and has no live backend or real-time SOS.
