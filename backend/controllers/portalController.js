import appointmentModel from "../models/appointmentModel.js";
import { messageModel, scheduleRequestModel } from "../models/portalModel.js";

const ORDER_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

const text = (value, max) =>
	typeof value === "string" && value.trim() && value.length <= max ? value.trim() : null;

/**
 * Advances the fulfilment status of an order (booking). Admins may update any
 * order; staff may only update their own. authAdminOrDoctor has already verified
 * the token before this runs.
 */
const updateOrderStatus = async (request, response) => {
	try {
		const { status } = request.body || {};
		if (!ORDER_STATUSES.includes(status)) {
			return response.status(400).json({ success: false, message: "Invalid status" });
		}
		const appointment = await appointmentModel.findById(request.params.id);
		if (!appointment) {
			return response.status(404).json({ success: false, message: "Order not found" });
		}
		if (
			request.actor.role === "staff" &&
			appointment.doctorId !== request.actor.id
		) {
			return response.status(403).json({ success: false, message: "Not authorized" });
		}
		appointment.status = status;
		if (status === "completed") appointment.isCompleted = true;
		await appointment.save();
		response.json({ success: true, status });
	} catch (error) {
		// Mongoose cast errors (bad ids) land here; keep details private.
		response.status(400).json({ success: false, message: "Could not update status" });
	}
};

/** Inbox for the signed-in role. */
const getMessages = async (request, response) => {
	try {
		const role = request.actor.role === "admin" ? "admin" : "staff";
		const messages = await messageModel.find({ role }).sort({ createdAt: -1 });
		response.json({ success: true, messages });
	} catch {
		response.status(500).json({ success: false, message: "Could not load messages" });
	}
};

/** Sends a message to a role. */
const postMessage = async (request, response) => {
	try {
		const { toRole, subject, body, sender } = request.body || {};
		if (!["admin", "staff"].includes(toRole)) {
			return response.status(400).json({ success: false, message: "Invalid recipient" });
		}
		const safeSubject = text(subject, 200);
		const safeBody = typeof body === "string" && body.length <= 5000 ? body.trim() : "";
		const safeSender = text(sender, 120);
		if (!safeSubject || !safeSender) {
			return response.status(400).json({ success: false, message: "Subject and sender are required" });
		}
		const message = await messageModel.create({
			role: toRole,
			subject: safeSubject,
			body: safeBody,
			sender: safeSender,
			senderRole: request.actor.role === "staff" ? "staff" : "admin",
		});
		response.status(201).json({ success: true, message });
	} catch {
		response.status(500).json({ success: false, message: "Could not send message" });
	}
};

/** Marks a message read for the signed-in role. */
const markMessageRead = async (request, response) => {
	try {
		const role = request.actor.role === "admin" ? "admin" : "staff";
		const message = await messageModel.findById(request.params.id);
		if (!message || (message.role !== role && request.actor.role !== "admin")) {
			return response.status(404).json({ success: false, message: "Message not found" });
		}
		message.read = true;
		await message.save();
		response.json({ success: true, read: true });
	} catch {
		response.status(400).json({ success: false, message: "Could not update message" });
	}
};

/** Admins see every schedule request; staff see only their own. */
const getScheduleRequests = async (request, response) => {
	try {
		const query =
			request.actor.role === "admin" ? {} : { doctorId: request.actor.id };
		const requests = await scheduleRequestModel.find(query).sort({ createdAt: -1 });
		response.json({ success: true, requests });
	} catch {
		response.status(500).json({ success: false, message: "Could not load requests" });
	}
};

/** Staff (or admin) submits a time-off / schedule-change request. */
const postScheduleRequest = async (request, response) => {
	try {
		const { type, date, reason, requester } = request.body || {};
		if (!["time-off", "schedule-change"].includes(type)) {
			return response.status(400).json({ success: false, message: "Invalid request type" });
		}
		const safeDate = text(date, 60);
		const safeRequester = text(requester, 120);
		if (!safeDate || !safeRequester) {
			return response.status(400).json({ success: false, message: "Date and requester are required" });
		}
		const created = await scheduleRequestModel.create({
			type,
			date: safeDate,
			reason: typeof reason === "string" && reason.length <= 500 ? reason.trim() : "",
			requester: safeRequester,
			role: request.actor.role === "admin" ? "admin" : "staff",
			doctorId: request.actor.role === "staff" ? request.actor.id : null,
		});
		response.status(201).json({ success: true, request: created });
	} catch {
		response.status(500).json({ success: false, message: "Could not submit request" });
	}
};

/** Admin approves/declines a request. */
const reviewScheduleRequest = async (request, response) => {
	try {
		if (request.actor.role !== "admin") {
			return response.status(403).json({ success: false, message: "Not authorized" });
		}
		const { status } = request.body || {};
		if (!["approved", "declined"].includes(status)) {
			return response.status(400).json({ success: false, message: "Invalid status" });
		}
		const updated = await scheduleRequestModel.findByIdAndUpdate(
			request.params.id,
			{ status },
			{ new: true }
		);
		if (!updated) {
			return response.status(404).json({ success: false, message: "Request not found" });
		}
		response.json({ success: true, status });
	} catch {
		response.status(400).json({ success: false, message: "Could not update request" });
	}
};

export {
	updateOrderStatus,
	getMessages,
	postMessage,
	markMessageRead,
	getScheduleRequests,
	postScheduleRequest,
	reviewScheduleRequest,
};
