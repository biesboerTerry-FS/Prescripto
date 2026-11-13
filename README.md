# Prescripto

Prescripto is a doctor appointment platform built as a full-stack portfolio project. It includes a patient-facing site, an admin panel, and an Express/MongoDB API, plus a React Native (Expo) patient app that talks to the same backend.

## What’s in the project

- **Patient web app (`frontend/`)** — browse doctors by specialty, search, view profiles, book and manage appointments, edit profile details, and export appointments to calendar files. Includes light/dark mode and responsive layouts.
- **Admin panel (`admin/`)** — dashboard and management views for doctors, patients, and appointments, with tools like availability toggles, CSV export, and patient detail pages.
- **API (`backend/`)** — Express server with JWT-based auth (including refresh flow and optional Google sign-in), role-aware admin access, appointment/booking logic, Stripe payment endpoints with a graceful demo mode when Stripe isn’t configured, seeded demo data, and static hosting for seeded doctor photos.
- **Mobile app (`mobile/`)** — Expo/React Native patient experience with email and Google sign-in, doctor browsing/search, booking, appointment management, and profile flows.
- **Quality & tooling** — Selenium-based end-to-end checks, accessibility/responsiveness audit script, Vercel/Render deployment configs, and CI workflow.

## Tech stack

- **Frontend/Admin:** React, Vite, React Router, Tailwind CSS, Axios, React Toastify
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Cloudinary, Stripe, Google OAuth verification, Helmet, rate limiting
- **Mobile:** React Native, Expo (Expo Router), TypeScript, Secure Store
- **Testing/Automation:** Selenium WebDriver, axe-core audit tooling

## Project structure

| Path | Purpose |
| --- | --- |
| `backend/` | API server, data models, controllers, routes, seed scripts/assets |
| `frontend/` | Patient web application |
| `admin/` | Admin web application |
| `mobile/` | React Native (Expo) patient app |
| `e2e/` | End-to-end and audit scripts |
| `.github/workflows/` | CI configuration |
| `render.yaml`, `*/vercel.json` | Deployment configuration |

## Notes

- Doctor photos for seeded data are served by the API from `/static/doctors`; their URLs depend on the API base URL used at seed time.
- Some integrations (Google sign-in, Stripe payments) are optional and the app includes fallback/demo behavior when they aren’t configured.
- This repository is set up for a typical split deployment: API + database hosted separately from the static frontend/admin builds.
