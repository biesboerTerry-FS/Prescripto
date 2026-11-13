import { getStripe, isStripeConfigured } from "../configs/stripe.js";
import appointmentModel from "../models/appointmentModel.js";

// Payment endpoints are intentionally "placeholder-friendly": when Stripe isn't configured,
// they return 503 so the rest of the app can still run in free/demo booking mode.

/**
 * Creates a Stripe PaymentIntent for an unpaid appointment owned by the current user.
 * The client uses the returned client secret to complete payment on the frontend.
 */
const createPayment = async (request, response) => {
	try {
		if (!isStripeConfigured) {
			return response.status(503).json({
				success: false,
				message: "Stripe is not configured (set STRIPE_SECRET_KEY)",
				code: "STRIPE_NOT_CONFIGURED",
			});
		}
		const { userId, appointmentId } = request.body;
		const appointment = await appointmentModel.findById(appointmentId);
		if (!appointment) {
			return response.json({
				success: false,
				message: "Appointment not found",
			});
		}
		if (appointment.userId !== userId) {
			return response.json({
				success: false,
				message: "Unauthorized action",
			});
		}
		if (appointment.payment) {
			return response.json({
				success: false,
				message: "Appointment is already paid",
			});
		}
		const stripe = getStripe();
		const intent = await stripe.paymentIntents.create({
			amount: Math.round(appointment.amount) * 100, // dollars → cents
			currency: process.env.STRIPE_CURRENCY || "usd",
			metadata: { appointmentId: appointment._id.toString(), userId },
			automatic_payment_methods: { enabled: true },
		});
		response.json({
			success: true,
			clientSecret: intent.client_secret,
			paymentIntentId: intent.id,
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

/**
 * Confirms a PaymentIntent with Stripe and marks the appointment as paid.
 * Used as a client-driven confirmation step after checkout succeeds.
 */
const confirmPayment = async (request, response) => {
	try {
		if (!isStripeConfigured) {
			return response.status(503).json({
				success: false,
				message: "Stripe is not configured (set STRIPE_SECRET_KEY)",
				code: "STRIPE_NOT_CONFIGURED",
			});
		}
		const { userId, appointmentId, paymentIntentId } = request.body;
		if (!appointmentId || !paymentIntentId) {
			return response.json({
				success: false,
				message: "Missing payment details",
			});
		}
		const appointment = await appointmentModel.findById(appointmentId);
		if (!appointment || appointment.userId !== userId) {
			return response.json({
				success: false,
				message: "Unauthorized action",
			});
		}
		const stripe = getStripe();
		const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
		if (intent.status !== "succeeded") {
			return response.json({
				success: false,
				message: "Payment has not succeeded",
			});
		}
		await appointmentModel.findByIdAndUpdate(appointmentId, {
			payment: true,
			stripePaymentIntentId: paymentIntentId,
		});
		response.json({ success: true, message: "Payment confirmed" });
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

/**
 * Handles Stripe webhooks (expects the raw request body and a valid signature).
 * On `payment_intent.succeeded` it marks the related appointment as paid as a server-side source of truth.
 */
const stripeWebhook = async (request, response) => {
	try {
		if (!isStripeConfigured || !process.env.STRIPE_WEBHOOK_SECRET) {
			return response.status(503).json({
				success: false,
				message: "Stripe webhook is not configured",
			});
		}
		const stripe = getStripe();
		const sig = request.headers["stripe-signature"];
		const event = stripe.webhooks.constructEvent(
			request.body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET
		);
		if (event.type === "payment_intent.succeeded") {
			const intent = event.data.object;
			const appointmentId = intent.metadata?.appointmentId;
			if (appointmentId) {
				await appointmentModel.findByIdAndUpdate(appointmentId, {
					payment: true,
					stripePaymentIntentId: intent.id,
				});
			}
		}
		response.sendStatus(200);
	} catch (error) {
		console.log(error);
		response.status(400).json({ success: false, message: error.message });
	}
};

export { createPayment, confirmPayment, stripeWebhook };
