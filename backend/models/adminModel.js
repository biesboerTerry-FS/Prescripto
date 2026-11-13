import mongoose from "mongoose";

// Stores the seeded admin account used for panel access.
const adminSchema = new mongoose.Schema({
	name: {
		type: String,
		default: "Administrator",
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

const adminModel = mongoose.models.admin || mongoose.model("Admin", adminSchema);

export default adminModel;
