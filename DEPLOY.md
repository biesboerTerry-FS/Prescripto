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

**Project B: admin panel**
- Root directory: `admin`
- Same settings as Project A, with `VITE_BACKEND_URL` set to the same API URL.

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

1. Google Cloud Console → **APIs & Services → Credentials → Create OAuth client ID** → type **Web application**.
2. **Authorized JavaScript origins:** add both Vercel URLs and `http://localhost:5173`.
3. Set the client ID in two places:
   - Vercel patient project: `VITE_GOOGLE_CLIENT_ID`
   - Render: `GOOGLE_CLIENT_ID`. This accepts a comma-separated list, so you can also add iOS and Android client IDs for the mobile app.

Without `VITE_GOOGLE_CLIENT_ID` the Google button is hidden and email sign-in still works.

## 6. Stripe payments (optional)

Without a Stripe key the app books appointments for free, which is fine for a portfolio.

1. Stripe Dashboard → create a **test** secret key → `STRIPE_SECRET_KEY` on Render.
2. Developers → Webhooks → add endpoint `https://prescripto-api.onrender.com/api/user/webhook`, event `payment_intent.succeeded` → copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Use test keys only (`sk_test_...`) unless you're taking real payments.

## 7. Verify

- [ ] `https://prescripto-api.onrender.com/health` returns `"db":"connected"`
- [ ] Patient site loads doctors with photos
- [ ] Log in as `demo@prescripto.com` / `Demo123456`, book a slot, see it in My Appointments
- [ ] Admin panel: log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, see the dashboard and patient list
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
