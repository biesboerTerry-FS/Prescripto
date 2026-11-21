import mongoose from "mongoose";

// HR collections backing the admin-only HR suite. Doctors are the staff in
// this app; their records live in doctorModel and are enriched with a few
// optional HR fields there. Everything in this file is written only through
// JWT-protected admin routes.

const departmentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 80,
	},
	description: { type: String, default: "", maxlength: 300 },
	head: { type: String, default: "", maxlength: 120 },
	createdAt: { type: Date, default: Date.now },
});

export const hrDepartmentModel =
	mongoose.models.hrdepartment ||
	mongoose.model("hrdepartment", departmentSchema);

const roleSchema = new mongoose.Schema({
	// A role label also doubles as a specialization label in the directory.
	label: {
		type: String,
		required: true,
		trim: true,
		maxlength: 120,
	},
	department: { type: String, default: "", maxlength: 80 },
	description: { type: String, default: "", maxlength: 300 },
	createdAt: { type: Date, default: Date.now },
});

export const hrRoleModel =
	mongoose.models.hrrole || mongoose.model("hrrole", roleSchema);

const payrunSchema = new mongoose.Schema({
	staffId: { type: String, required: true, index: true },
	staffName: { type: String, required: true, maxlength: 120 },
	department: { type: String, default: "", maxlength: 80 },
	// Billing month in YYYY-MM form.
	period: { type: String, required: true, maxlength: 20, index: true },
	amount: { type: Number, required: true, min: 0 },
	status: {
		type: String,
		enum: ["draft", "processed", "paid"],
		default: "processed",
	},
	paymentDate: { type: String, default: "" },
	note: { type: String, default: "", maxlength: 300 },
	createdAt: { type: Date, default: Date.now },
});

export const hrPayrunModel =
	mongoose.models.hrpayrun || mongoose.model("hrpayrun", payrunSchema);

const noteSchema = new mongoose.Schema({
	staffId: { type: String, required: true, index: true },
	staffName: { type: String, default: "", maxlength: 120 },
	author: { type: String, required: true, maxlength: 120 },
	text: { type: String, required: true, maxlength: 2000 },
	date: { type: String, default: "" },
	createdAt: { type: Date, default: Date.now },
});

export const hrNoteModel =
	mongoose.models.hrnote || mongoose.model("hrnote", noteSchema);
