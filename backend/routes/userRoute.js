import express from "express";

// Patient-facing API routes: auth, profile, booking, appointments, and payments.
import {
	registerUser,
	loginUser,
	loginOAuth,
	demoOAuthLogin,
	refreshToken,
	getProfile,
	updateProfile,
	bookAppointment,
	listAppointments,
	cancelAppointment,
	saveCookieConsent,
	clerkSync,
} from "../controllers/userController.js";
import {
	createPayment,
	confirmPayment,
	stripeWebhook,
} from "../controllers/paymentController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/oauth-google", loginOAuth);
userRouter.post("/oauth-google-demo", demoOAuthLogin);
userRouter.post("/clerk-sync", clerkSync);
userRouter.post("/refresh", authUser, refreshToken);
userRouter.get("/get-profile", authUser, getProfile);
// Authenticate BEFORE multer so unauthenticated callers cannot make the server
// parse/accept an upload. authUser stores the id on request.userId as well,
// because multer replaces request.body with the parsed multipart fields.
userRouter.put(
	"/update-profile",
	authUser,
	upload.single("image"),
	updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.put("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/cookie-consent", authUser, saveCookieConsent);
userRouter.post("/create-payment", authUser, createPayment);
userRouter.post("/confirm-payment", authUser, confirmPayment);
// Stripe webhooks need the raw body — parsed in server.js BEFORE
// express.json(); do not re-add express.json()/raw here.
userRouter.post("/webhook", stripeWebhook);

export default userRouter;
