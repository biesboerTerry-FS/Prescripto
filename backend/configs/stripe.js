import Stripe from "stripe";

// Stripe is intentionally optional in this portfolio build: when
// STRIPE_SECRET_KEY is missing the server still boots, and the payment
// endpoints return 503 with a "not configured" message so the app falls
// back to free booking. Add a test key (sk_test_...) to enable live mode.
let stripe = null;

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

export const getStripe = () => {
	if (!stripe) {
		if (!isStripeConfigured) return null;
		stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: "2024-12-18",
			telemetry: false,
		});
	}
	return stripe;
};

export default getStripe;
