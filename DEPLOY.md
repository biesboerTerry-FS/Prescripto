# Deploying Prescripto

Prescripto is three deployable pieces plus a database:

| Piece | Folder | Host | Notes |
|---|---|---|---|
| Patient site | `frontend/` | Vercel | Static Vite build |
| Admin panel | `admin/` | Vercel | Static Vite build, `noindex` |
| API | `backend/` | Render | Express. Serves doctor photos at `/static/doctors` |
| Database | Atlas | MongoDB Atlas | Free M0 cluster is enough |

The mobile app (`mobile/`) is not deployed. It runs in Expo Go, or can be built with EAS later.

Deploy in this order: database → API → seed → frontends. The frontends need the API URL, and the seed needs the API URL for photos.

---

## 1. Database (MongoDB Atlas)

1. Create a free M0 cluster (or resume the old one, if it still exists).
2. **Database Access:** add a user with read and write permission. Use a generated password.
3. **Network Access:** add `0.0.0.0/0`. Atlas needs this because Render's IPs change.
4. **Connect → Drivers:** copy the connection string. Keep it, but do not add a database name or a trailing slash. The app appends `/prescripto` itself.

## 2. API (Render)

1. Push the repo to GitHub.
2. Render → **New → Blueprint**, pick the repo. Render reads `render.yaml` (root folder `backend/`, Node 22, health check `/health`).
3. Enter the secret values when Render asks (or add them under **Environment**):

| Variable | Value |
|---|---|
| `MONGO_URI` | Atlas string from step 1 |
| `JWT_SECRET` | a long random string, e.g. `openssl rand -hex 32` |
| `ADMIN_EMAIL` | admin login email |
| `ADMIN_PASSWORD` | a strong admin password |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY` | from your Cloudinary dashboard |
| `CORS_ORIGIN` | leave empty for now, fill in step 3 |
| `GOOGLE_CLIENT_ID` | optional, see step 5 |
| `CLERK_SECRET_KEY` | optional, see step 7 (Clerk patient auth) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | optional, see step 6 |

`NODE_ENV=production` is already set in `render.yaml`. In production the API refuses to start if `MONGO_URI` or `JWT_SECRET` is missing.

4. Deploy, then note the URL, e.g. `https://prescripto-api.onrender.com`.
5. Check it: `https://prescripto-api.onrender.com/health` should return `{"success":true,"db":"connected"}`.

**Free tier note:** Render sleeps the service after about 15 minutes without traffic. The first request after that takes 30–60 seconds. See "Options" below to avoid this.

## 3. Patient site and admin panel (Vercel)

Import the same GitHub repo **twice**, as two Vercel projects:

**Project A: patient site**
- Root directory: `frontend`
- Framework preset: Vite (auto-detected)
- Build command: `npm run build`, output directory: `dist`
- Environment variables:
  - `VITE_BACKEND_URL` = `https://prescripto-api.onrender.com` (no trailing slash)
  - `VITE_GOOGLE_CLIENT_ID` = optional, see step 5
  - `VITE_CLERK_PUBLISHABLE_KEY` = optional, see step 7

**Project B: admin panel**
- Root directory: `admin`
- Same settings as Project A, with `VITE_BACKEND_URL` set to the same API URL. No Clerk key is needed for admin.

Each folder has a `vercel.json` that routes page refreshes to `index.html` and adds security headers. The admin folder also adds `X-Robots-Tag: noindex`.

Deploy both, then note the two URLs, e.g. `https://prescripto.vercel.app` and `https://prescripto-admin.vercel.app`.

**Connect the API to the sites:** in Render, set `CORS_ORIGIN` to both Vercel URLs, separated by a comma, with no spaces:

```
CORS_ORIGIN=https://prescripto.vercel.app,https://prescripto-admin.vercel.app
```

Render redeploys automatically. Without this, the browser blocks every API call from the sites.

## 4. Seed the live database (once)

Run from your computer with the live values. Set `PUBLIC_API_URL` to the Render URL before seeding, because the doctor photo links are written into the database at this point:

```bash
cd backend
MONGO_URI="mongodb+srv://..." \
PUBLIC_API_URL="https://prescripto-api.onrender.com" \
JWT_SECRET="..." \
ADMIN_EMAIL="..." ADMIN_PASSWORD="..." \
npm run seed
```

This creates:
- the admin account (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- 60 doctors, 10 per specialty, with photos served from `https://prescripto-api.onrender.com/static/doctors/...`
- 5 demo patients, including `demo@prescripto.com` / `Demo123456`
- sample appointments for the demo patient

The seed is safe to re-run: it updates existing records rather than duplicating them. If you ever change the API URL, re-run the seed with the new `PUBLIC_API_URL`.

## 5. Google sign-in (optional)

### Patient site (web)

1. Google Cloud Console → **APIs & Services → Credentials → Create OAuth client ID** → type **Web application**.
2. **Authorized JavaScript origins:** add both Vercel URLs and `http://localhost:5173`.
3. Set the client ID in two places:
   - Vercel patient project: `VITE_GOOGLE_CLIENT_ID`
   - Render: `GOOGLE_CLIENT_ID`

### Mobile app

The mobile app uses `expo-auth-session`, which needs a **Web application** OAuth client even for native devices.

1. In the same Google Cloud project, create another **Web application** client ID (or reuse the web one).
2. Run the app in Expo Go and press the Google sign-in button. The Metro logs print the exact redirect URI, usually:
   - Expo Go: `https://auth.expo.io/@your-username/prescripto/auth`
   - Development build / standalone: `prescripto://auth`
3. Add that URI under **Authorized redirect URIs** for the Web application client.
4. Set the client ID in `mobile/.env`:
   - `EXPO_PUBLIC_GOOGLE_CLIENT_ID` = the Web application client ID
5. Add the same ID to Render's `GOOGLE_CLIENT_ID` (comma-separated if you have several).

For production standalone builds you can instead create **iOS** and **Android** OAuth clients and set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`; add those IDs to Render's `GOOGLE_CLIENT_ID` list as well.

Without a Google client ID the app shows a demo Google button that signs into a shared preview account.

## 6. Stripe payments (optional)

Without a Stripe key the app books appointments for free, which is fine for a portfolio.

1. Stripe Dashboard → create a **test** secret key → `STRIPE_SECRET_KEY` on Render.
2. Developers → Webhooks → add endpoint `https://prescripto-api.onrender.com/api/user/webhook`, event `payment_intent.succeeded` → copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Use test keys only (`sk_test_...`) unless you're taking real payments.

## 7. Clerk patient auth (optional)

Clerk is used for the patient frontend and patient mobile only. Admin/doctor auth still uses the existing backend JWT/admin token system.

1. Confirm or claim your Clerk application (`app_3M3vllwlXHEu27jOGskDmS1bC7s`). If the CLI reports 404, run `npx -y clerk@latest auth login` from your host terminal, confirm access, and link/pull keys.
2. Add keys/env variables:
   - **Render:** `CLERK_SECRET_KEY`
   - **Vercel patient project:** `VITE_CLERK_PUBLISHABLE_KEY`
   - **Mobile builds/Expo:** `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `mobile/.env`
3. In the Clerk Dashboard, enable desired sign-in strategies (email, social) and set authorized origins/redirects:
   - Web: patient Vercel URL and `http://localhost:5173` (or `http://localhost:5190` if running local on that port)
   - Expo/mobile: use the Clerk default OAuth redirect handling for Expo Go/standalone builds
4. Redeploy the API and patient frontend. When Clerk is enabled, the frontend/mobile sign-in flows will use Clerk and the backend will issue existing patient JWTs via `POST /api/user/clerk-sync`.

If `VITE_CLERK_PUBLISHABLE_KEY`/`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` are empty, the existing email/password + Google/demo sign-in flows remain active.

## 8. Staff mobile app (`mobile-staff/`)

The staff app is a separate Expo app for admin (and future doctor) mobile access. It is not deployed to Vercel; it runs locally in Expo Go or can be built with EAS.

1. `cd mobile-staff && npm install`
2. Set `EXPO_PUBLIC_API_URL` in `mobile-staff/.env` to the Render/production API URL (or local `http://localhost:3100`).
3. `npm start` → scan QR in Expo Go.
4. Sign in with admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Dashboard/doctors/appointments/patients screens use existing `/api/admin/*` APIs.
5. Doctor-specific login/workflows are not available yet because backend doctor auth/routes are not implemented. Admin features work now and can be extended when doctor endpoints exist.

## 9. Verify

- [ ] `https://prescripto-api.onrender.com/health` returns `"db":"connected"`
- [ ] Patient site loads doctors with photos
- [ ] Log in as `demo@prescripto.com` / `Demo123456`, book a slot, see it in My Appointments
- [ ] Clerk enabled: sign up/in with Clerk on patient frontend/mobile, profile/appointments load
- [ ] Admin panel: log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, see the dashboard and patient list
- [ ] Staff mobile app: admin login shows dashboard/doctors/appointments/patients
- [ ] Browser console shows no CORS errors
- [ ] Page refresh on `/doctors/Neurologist` works (not a 404)

## Options

These are optional, but worth considering for a portfolio:

- **Avoid the cold start:** point a free uptime monitor (UptimeRobot, Better Stack) at `/health` every 5 minutes. This keeps the Render service awake.
- **Custom domain:** add it under Vercel → Domains and Render → Settings → Custom Domains. Then update `CORS_ORIGIN` and the Google origins.
- **Continuous checks:** `.github/workflows/ci.yml` installs and builds all four projects on every push. Add a status badge to the README once the repo is on GitHub.
- **Keep it free:** the setup above costs nothing on Vercel Hobby, Render free, and Atlas M0. Cloudinary's free tier covers the admin's uploads.
- **Hosting alternatives:** the API is a plain Node server, so it also runs on Railway, Fly.io, or a VPS with `npm run server`.

## Security checklist

- [ ] Rotate every secret that was ever pasted in chat or committed: the Atlas password, Cloudinary keys, admin password, and JWT secret.
- [ ] Use a different `JWT_SECRET` in production from the one in your local `.env`.
- [ ] Confirm `.env` files are not in git (`git status` should not list them).
- [ ] The API already sends security headers (helmet) and rate-limits login and sign-up: 30 attempts per 15 minutes per visitor.
- [ ] The admin panel is marked `noindex`, but it's still reachable. Don't share the admin URL publicly, and consider the demo admin login as a read-only account if you show it to visitors.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Browser console: "blocked by CORS policy" | `CORS_ORIGIN` on Render is missing the site's exact URL. Include `https://`, no trailing slash. |
| Doctor photos don't load | Seed ran with the wrong `PUBLIC_API_URL`. Re-run the seed with the Render URL. |
| Doctor list is empty, `/health` says `not_connected` | Atlas: wrong password, the user lacks access, or Network Access doesn't allow `0.0.0.0/0`. |
| API won't start on Render: "Missing required environment variables" | `MONGO_URI` or `JWT_SECRET` is not set in Render's Environment tab. |
| Login says "Too many attempts" | Rate limit hit (30 per 15 min). Wait 15 minutes. |
| Admin sees "Not authorized" after a deploy | Admin tokens changed format. Log out and back in. |
| Vercel page refresh returns 404 | `vercel.json` missing from the project's root directory. Check the root directory setting is `frontend` or `admin`. |
| Render build fails on `bcrypt` | Confirm `NODE_VERSION` is `22` in Render's environment. |
