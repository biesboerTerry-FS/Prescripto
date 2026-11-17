# Prescripto

A full-stack doctor appointment platform built as a portfolio project. It demonstrates patient-facing booking, admin management, JWT + Clerk-ready authentication, payments, and mobile apps.

## Live demo

- **Patient site:** https://frontend-seven-puce-50.vercel.app
- **Admin panel:** https://admin-eight-rosy.vercel.app
- **API:** *(deploy to Render — see `DEPLOY.md`)*
- **Source:** [github.com/biesboerTerry-FS/Prescripto](https://github.com/biesboerTerry-FS/Prescripto)

Try the patient experience instantly with the demo account (works once the API is deployed):

- **Email:** `demo@prescripto.com`
- **Password:** `Demo123456`

## What's included

| Piece | Folder | Notes |
| --- | --- | --- |
| Patient web app | `frontend/` | Vite + React, responsive, light/dark mode, doctor search/booking, profile, appointments |
| Admin panel | `admin/` | Vite + React, dashboard, doctor/patient/appointment management, CSV export |
| API | `backend/` | Express + MongoDB, JWT auth, optional Clerk bridge, Google OAuth, Stripe/demo payments, seed data |
| Patient mobile app | `mobile/` | Expo + React Native, doctor browsing, booking, appointments, profile |
| Staff mobile app | `mobile-staff/` | Expo + React Native admin app (doctor workflows ready to extend) |

## Tech stack

- **Frontend/Admin:** React, Vite, React Router, Tailwind CSS, Axios, React Toastify
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Cloudinary, Stripe, Google OAuth, Helmet, rate limiting
- **Mobile:** React Native, Expo Router, TypeScript, Secure Store
- **Auth:** Custom JWT for patients/admins, Clerk bridge for patient frontend/mobile (optional, requires keys)
- **Quality:** Selenium e2e checks, axe-core audit tooling, GitHub Actions CI, Render + Vercel configs

## Quick start (local)

```bash
# 1. API
cd backend
cp .env.example .env       # fill MONGO_URI, JWT_SECRET, etc.
npm install
npm run server             # http://localhost:3100

# 2. Patient site
cd ../frontend
cp .env.example .env       # VITE_BACKEND_URL=http://localhost:3100
npm install
npm run dev                # http://localhost:5173 (or 5190)

# 3. Admin panel
cd ../admin
cp .env.example .env       # VITE_BACKEND_URL=http://localhost:3100
npm install
npm run dev                # http://localhost:5173 (or 5191)
```

See `DEPLOY.md` for production deployment steps (Render, Vercel, seeding, Clerk, Google OAuth, Stripe).

## Project highlights

- **Portfolio-ready:** demo login, GitHub source link, tech-stack showcase, analytics/speed-insights instrumentation.
- **Clerk-ready patient auth:** the patient frontend and mobile can use Clerk while admin/doctor auth remain unchanged.
- **Mobile apps:** separate patient (`mobile/`) and staff (`mobile-staff/`) Expo apps.
- **No real payments required:** Stripe is optional; the app falls back to free demo booking when Stripe keys are absent.

## License

MIT
