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
userRouter.post("/refresh", authUser, refreshToken);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.put(
	"/update-profile",
	upload.single("image"),
	authUser,
	updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.put("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/create-payment", authUser, createPayment);
userRouter.post("/confirm-payment", authUser, confirmPayment);
// Stripe webhooks need the raw body — parsed in server.js BEFORE
// express.json(); do not re-add express.json()/raw here.
userRouter.post("/webhook", stripeWebhook);

export default userRouter;
