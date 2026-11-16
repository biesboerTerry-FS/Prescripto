# Prescripto Staff Mobile

Expo/React Native app for **admin** (and future doctor) access to Prescripto.

## Current scope
- **Admin:** sign in with existing admin credentials (`/api/admin/login`), view dashboard stats, manage doctors/availability, view/cancel appointments, and browse patients via existing `/api/admin/*` APIs (`admintoken` header).
- **Doctor:** backend doctor authentication/routes are not implemented yet, so doctor-specific login/workflows are not available in this app. The structure can be extended when those APIs exist.
- **Patient app:** remains in `../mobile/` (separate app/auth).

## Setup
1. Install dependencies: `npm install`
2. Create `.env` (or set env) with `EXPO_PUBLIC_API_URL` pointing to the backend (e.g. `http://localhost:3100`, LAN IP for devices, or deployed API URL).
3. Start: `npm start`

## Notes
- Uses existing admin auth; no Clerk integration in this app.
- Do not commit secrets in `.env`.
