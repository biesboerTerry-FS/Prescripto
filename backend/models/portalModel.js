import mongoose from "mongoose";

// Small collections backing the admin/staff portal features. All writes go
// through authenticated routes; the browser keeps a localStorage copy for the
// offline portfolio demo.

const messageSchema = new mongoose.Schema({
	// Who should see the message in their inbox.
	role: { type: String, enum: ["admin", "staff"], required: true, index: true },
	subject: { type: String, required: true, maxlength: 200 },
	body: { type: String, default: "", maxlength: 5000 },
	sender: { type: String, required: true, maxlength: 120 },
	senderRole: {
		type: String,
		enum: ["admin", "staff", "system", "patient"],
		default: "system",
	},
	read: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
});

export const messageModel =
	mongoose.models.message || mongoose.model("message", messageSchema);

const scheduleRequestSchema = new mongoose.Schema({
	type: { type: String, enum: ["time-off", "schedule-change"], required: true },
	// Staff submit requests; admins see all of them.
	role: { type: String, enum: ["admin", "staff"], default: "staff" },
	doctorId: { type: String, default: null, index: true },
	requester: { type: String, required: true, maxlength: 120 },
	date: { type: String, required: true, maxlength: 60 },
	reason: { type: String, default: "", maxlength: 500 },
	status: {
		type: String,
		enum: ["pending", "approved", "declined"],
		default: "pending",
	},
	createdAt: { type: Date, default: Date.now },
});

export const scheduleRequestModel =
	mongoose.models.schedulerequest ||
	mongoose.model("schedulerequest", scheduleRequestSchema);
