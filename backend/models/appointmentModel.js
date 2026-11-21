import mongoose from "mongoose";

// Stores a booking snapshot, including the user/doctor data, status, and payment info.
const appointmentSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	doctorId: {
		type: String,
		required: true,
	},
	slotDate: {
		type: String,
		required: true,
	},
	slotTime: {
		type: String,
		required: true,
	},
	userData: {
		type: Object,
		required: true,
	},
	doctorData: {
		type: Object,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	date: {
		type: Number,
		required: true,
	},
	cancelled: {
		type: Boolean,
		default: false,
	},
	payment: {
		type: Boolean,
		default: false,
	},
	stripePaymentIntentId: {
		type: String,
		default: null,
	},
	isCompleted: {
		type: Boolean,
		default: false,
	},
	// Fulfilment state used by the Orders views. Older bookings without this
	// field are treated as "pending" by the API/UI.
	status: {
		type: String,
		enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
		default: "pending",
	},
});

const appointmentModel =
	mongoose.models.appointment ||
	mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
