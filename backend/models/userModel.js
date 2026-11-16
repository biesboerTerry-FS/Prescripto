import mongoose from "mongoose";

// Stores patient accounts (local or Google-linked) and basic profile details.
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	// optional so OAuth users (created from a Google profile) can exist
	// without a local password; local sign-up still validates on the server
	password: {
		type: String,
		default: "",
	},
	googleId: {
		type: String,
		default: null,
	},
	clerkId: {
		type: String,
		default: null,
	},
	provider: {
		type: String,
		default: "local",
	},
	image: {
		type: String,
		default: "Not Selected",
	},
	address: {
		type: Object,
		default: {
			line1: "",
			line2: "",
		},
	},
	gender: {
		type: String,
		default: "Not Selected",
	},
	dob: {
		type: String,
		default: "Not Selected",
	},
	phone: {
		type: String,
		default: "0000000000",
	},
	cookieConsent: {
		type: Object,
		default: null,
	},
});

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;
