import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import connectDB from "./configs/mongoDB.js";
import connectCloudinary from "./configs/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// fail fast in production instead of starting half-configured
const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (process.env.NODE_ENV === "production" && missing.length) {
	console.error(`Missing required environment variables: ${missing.join(", ")}`);
	process.exit(1);
}
// A short or placeholder JWT secret can be brute-forced offline from a single
// captured token. Never start production with one; log only the problem, not
// the secret value itself.
if (process.env.NODE_ENV === "production") {
	const secret = process.env.JWT_SECRET || "";
	if (secret.length < 32 || /^(change-?me|secret|password|test)$/i.test(secret)) {
		console.error("JWT_SECRET is too weak: use at least 32 random characters (e.g. `openssl rand -hex 32`).");
		process.exit(1);
	}
}
if (!process.env.CORS_ORIGIN) {
	console.warn("CORS_ORIGIN is not set, so any origin can call the API. Set it in production.");
}

// app config
const app = express();
// Render sits behind a proxy: use the real client IP for rate limiting
app.set("trust proxy", 1);

// connectDB() handles its own errors and returns false instead of crashing
// the process on an unhandled rejection (previously fatal on Node 22+).
const dbConnected = await connectDB();
connectCloudinary();

// security headers. Images are served to other origins (the Vercel sites).
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// middlewares
// Stripe webhooks must run on the RAW body (signature verification) — parse
// before express.json() so the JSON middleware can't consume the payload.
app.use("/api/user/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
// Dev (no CORS_ORIGIN): accept all origins. Prod: the configured Vercel URLs,
// plus every other *.vercel.app origin so Git branches, preview deploys, and
// legacy aliases (e.g. the -git-main and -akovorl10 URLs) keep working instead
// of failing with "Could not load doctors" due to a blocked XHR.
const configuredOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
	: [];
app.use(
	cors({
		origin: (origin, callback) => {
			// Non-browser requests (curl, health checks) have no Origin header.
			if (!origin) return callback(null, true);
			if (!process.env.CORS_ORIGIN || configuredOrigins.includes(origin)) {
				return callback(null, true);
			}
			try {
				const { hostname } = new URL(origin);
				if (hostname === "localhost" || hostname.endsWith(".vercel.app")) {
					return callback(null, true);
				}
			} catch {
				// malformed Origin — rejected below
			}
			return callback(new Error("Not allowed by CORS"));
		},
	})
);

// static assets (seeded doctor photos live in public/static/doctors)
// Vercel serves public/ directly; this middleware is a fallback for local dev.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/static", express.static(path.join(__dirname, "public", "static")));

// slow down password guessing and sign-up spam
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: { success: false, message: "Too many attempts. Try again in 15 minutes." },
});
app.use(
	[
		"/api/user/login",
		"/api/user/register",
		"/api/user/oauth-google",
		"/api/user/oauth-google-demo",
		"/api/admin/login",
		"/api/doctor/login",
	],
	authLimiter
);

// API endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// Simple root endpoint so uptime checks or humans can confirm the API process is alive.
app.get("/", (req, res) => {
	res.send("API Working");
});

// Reports API and database status; returns 503 when MongoDB is not connected so monitors can catch it.
app.get("/health", (req, res) => {
	const db = dbConnected ? "connected" : "not_connected";
	res.status(dbConnected ? 200 : 503).json({ success: dbConnected, db });
});

export { dbConnected };
export default app;
