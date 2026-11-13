# Prescripto mobile

Patient app for iOS and Android, built with Expo (SDK 58), Expo Router and TypeScript. It talks to the same Express API as the web app in `../backend`.

## Features

- Email/password sign up and sign in, plus **Continue with Google** (OpenID Connect ID token, verified by the backend)
- Browse doctors, filter by specialty
- Doctor profile and booking: next-week days, 30-minute slots, live availability
- My appointments: view status and cancel
- Profile and sign out
- Session token stored with `expo-secure-store`

## Run it

```bash
cd mobile
cp .env.example .env        # set EXPO_PUBLIC_API_URL (see below)
npm install
npx expo start
```

Open the app with Expo Go, or press `i` / `a` for a simulator.

### Reaching the API from a device

A phone can't reach `localhost` on your computer:

| Where you run the app | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS simulator | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical phone | `http://<your-computer-LAN-IP>:3000` (same Wi-Fi) |

Doctor photos come from `PUBLIC_API_URL` in `backend/.env` (used when seeding). For a phone, set it to the same LAN IP and re-run `npm run seed`.

## Google sign-in

1. In Google Cloud Console, create an OAuth client. A Web client is fine for Expo Go. For a build, add iOS and/or Android clients too.
2. Put the client ID in `mobile/.env` as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`.
3. Put every client ID you use in `backend/.env` as `GOOGLE_CLIENT_ID`, comma-separated.
4. Add the redirect URI that `expo-auth-session` prints (`makeRedirectUri`) to the client. Expo Go shows an `exp://...` URL that changes with your network. Native builds use `prescripto://auth`.

Without `EXPO_PUBLIC_GOOGLE_CLIENT_ID` the button is hidden and email sign-in still works.

This uses the OpenID Connect implicit flow via `expo-auth-session`, which needs no native code. For production, Expo recommends a native library (`@react-native-google-signin/google-signin` or `react-native-nitro-google-signin`) with a development build. See https://docs.expo.dev/guides/google-authentication/.

## Project layout

```
src/
  app/                 Expo Router screens (file-based routes)
    _layout.tsx        Root stack; Stack.Protected switches auth and app screens
    (auth)/            sign-in, sign-up
    (tabs)/            Home, Doctors, Appointments, Profile
    doctor/[id].tsx    Doctor profile and booking
  components/          DoctorCard, SpecialtyChips, shared UI
  lib/
    api.ts             Typed calls to the Express API
    slots.ts           Booking-slot rules (same as the web app)
    session.tsx        Token storage and auth context
    useGoogleSignIn.ts Google OpenID sign-in hook
    theme.ts, types.ts
```

## Checks

```bash
npm run typecheck                 # tsc --noEmit
npx expo-doctor                   # dependency and config checks
npm run export:android            # bundles the app to catch runtime import errors
```

## Limits

- Not yet tested on a physical device or in a simulator in this repo. The type check, `expo-doctor`, and Android/iOS bundles pass.
- An expired token shows a "session has expired" message. The app doesn't sign you out automatically yet.
- Payments are not in the mobile app. The web app's Stripe placeholder covers that flow.
