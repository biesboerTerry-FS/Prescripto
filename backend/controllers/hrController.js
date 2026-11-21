import bcrypt from "bcrypt";
import validator from "validator";
import mongoose from "mongoose";
import doctorModel from "../models/doctorModel.js";
import { scheduleRequestModel } from "../models/portalModel.js";
import {
	hrDepartmentModel,
	hrRoleModel,
	hrPayrunModel,
	hrNoteModel,
} from "../models/hrModel.js";

// All handlers in this file sit behind authAdmin. They apply their own input
// validation so a valid admin token still cannot write malformed HR records.

const TRANSPARENT_PIXEL =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const fail = (response, status, message) =>
	response.status(status).json({ success: false, message });

const text = (value, max, { required = false, min = 1 } = {}) => {
	if (typeof value !== "string") return required ? null : undefined;
	const trimmed = value.trim();
	if (!trimmed) return required ? null : undefined;
	if (trimmed.length < min || trimmed.length > max) return null;
	return trimmed;
};

const idString = (value) =>
	typeof value === "string" && mongoose.Types.ObjectId.isValid(value)
		? value
		: null;

const today = () => new Date().toISOString().slice(0, 10);

const asAddress = (value) => {
	if (value === undefined || value === null || value === "") {
		return { line1: "", line2: "" };
	}
	if (typeof value !== "object" || Array.isArray(value)) return null;
	const out = {};
	for (const key of ["line1", "line2"]) {
		const line = value[key];
		if (line !== undefined && line !== null) {
			if (typeof line !== "string" || line.length > 160) return null;
			out[key] = line.trim();
		}
	}
	return { line1: out.line1 || "", line2: out.line2 || "" };
};

const publicStaff = (doctor) => {
	const base = doctor.toObject ? doctor.toObject() : { ...doctor };
	delete base.password;
	delete base.slots_booked;
	return {
		...base,
		id: base._id ? base._id.toString() : base.id,
		role: base.hrRole || base.specialty || "Staff",
		rate: base.fees || 0,
		status: base.hrStatus || "active",
	};
};

// ---- Staff directory / management ----------------------------------------

/** Lists every doctor/staff member, newest first, without password hashes. */
const listStaff = async (_request, response) => {
	try {
		const doctors = await doctorModel.find({}).sort({ date: -1 });
		response.json({ success: true, staff: doctors.map(publicStaff) });
	} catch (error) {
		console.error(error);
		return fail(response, 500, "Could not load staff");
	}
};

/** Detail view for one staff member. */
const staffDetail = async (request, response) => {
	const id = idString(request.params.id);
	if (!id) return fail(response, 400, "Invalid staff id");
	try {
		const doctor = await doctorModel.findById(id).select("-password");
		if (!doctor) return fail(response, 404, "Staff member not found");
		const [payruns, notes] = await Promise.all([
			hrPayrunModel.find({ staffId: id }).sort({ createdAt: -1 }).limit(12),
			hrNoteModel.find({ staffId: id }).sort({ createdAt: -1 }).limit(12),
		]);
		response.json({
			success: true,
			staff: publicStaff(doctor),
			payruns,
			notes,
		});
	} catch (error) {
		console.error(error);
		return fail(response, 500, "Could not load staff details");
	}
};

/** Adds a staff member (a doctor with HR fields). Login fields are preserved. */
const addStaff = async (request, response) => {
	try {
		const body = request.body || {};
		const name = text(body.name, 120, { required: true, min: 2 });
		const emailRaw = text(body.email, 254, { required: true });
		const password = typeof body.password === "string" ? body.password : "";
		const specialty = text(body.specialty || body.role, 120, { required: true });
		const role = text(body.role || body.specialty, 120) || specialty;
		const department = text(body.department, 80) || "";
		const phone = text(body.phone, 40) || "";
		const address = asAddress(body.address);
		const fees = Number(body.fees ?? body.rate);
		const hrStatus = body.hrStatus === "inactive" ? "inactive" : "active";
		const degree = text(body.degree, 120) || "Not specified";
		const experience = text(body.experience, 60) || "0 Years";
		const about = text(body.about, 2000) || "Staff member profile.";
		const image = text(body.image, 2000) || TRANSPARENT_PIXEL;

		if (!name || !emailRaw || !specialty) {
			return fail(response, 400, "Name, email and role are required");
		}
		if (!validator.isEmail(emailRaw)) {
			return fail(response, 400, "Enter a valid email address");
		}
		if (password.length < 6 || password.length > 128) {
			return fail(response, 400, "Password must be 6 to 128 characters");
		}
		if (!address) return fail(response, 400, "Enter a valid address");
		if (!Number.isFinite(fees) || fees < 0 || fees > 1000000) {
			return fail(response, 400, "Enter a valid rate");
		}
		const normalizedEmail = emailRaw.toLowerCase();
		if (await doctorModel.findOne({ email: normalizedEmail })) {
			return fail(response, 409, "A staff member with that email already exists");
		}

		const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
		const doctor = await doctorModel.create({
			name,
			email: normalizedEmail,
			password: hashedPassword,
			image,
			specialty,
			hrRole: role,
			department,
			phone,
			degree,
			experience,
			about,
			fees,
			address,
			hrStatus,
			available: true,
			date: Date.now(),
			slots_booked: {},
		});
		response.status(201).json({
			success: true,
			message: "Staff member added",
			staff: publicStaff(doctor),
		});
	} catch (error) {
		console.error(error);
		return fail(response, 500, "Could not add staff member");
	}
};

/** Edits HR/contact fields. Password is only touched when explicitly supplied. */
const updateStaff = async (request, response) => {
	const id = idString(request.params.id);
	if (!id) return fail(response, 400, "Invalid staff id");
	try {
		const body = request.body || {};
		const doctor = await doctorModel.findById(id);
		if (!doctor) return fail(response, 404, "Staff member not found");

		const updates = {};
		if (body.name !== undefined) {
			const name = text(body.name, 120, { required: true, min: 2 });
			if (!name) return fail(response, 400, "Enter a valid name");
			updates.name = name;
		}
		if (body.email !== undefined) {
			const emailRaw = text(body.email, 254, { required: true });
			if (!emailRaw || !validator.isEmail(emailRaw)) {
				return fail(response, 400, "Enter a valid email address");
			}
			const normalized = emailRaw.toLowerCase();
			if (
				await doctorModel.findOne({ email: normalized, _id: { $ne: id } })
			) {
				return fail(response, 409, "That email is already in use");
			}
			updates.email = normalized;
		}
		if (body.password !== undefined && body.password !== "") {
			if (
				typeof body.password !== "string" ||
				body.password.length < 6 ||
				body.password.length > 128
			) {
				return fail(response, 400, "Password must be 6 to 128 characters");
			}
			updates.password = await bcrypt.hash(
				body.password,
				await bcrypt.genSalt(10)
			);
		}
		for (const [key, max] of [
			["specialty", 120],
			["hrRole", 120],
			["department", 80],
			["phone", 40],
			["degree", 120],
			["experience", 60],
			["about", 2000],
		]) {
			if (body[key] !== undefined) {
				const value = text(body[key], max);
				if (value === null) return fail(response, 400, `Invalid ${key}`);
				updates[key] = value === undefined ? "" : value;
			}
		}
		if (body.role !== undefined && body.specialty === undefined) {
			const role = text(body.role, 120);
			if (role === null) return fail(response, 400, "Invalid role");
			updates.hrRole = role || "";
		}
		if (body.fees !== undefined) {
			const fees = Number(body.fees ?? body.rate);
			if (!Number.isFinite(fees) || fees < 0 || fees > 1000000) {
				return fail(response, 400, "Enter a valid rate");
			}
			updates.fees = fees;
		}
		if (body.address !== undefined) {
			const address = asAddress(body.address);
			if (!address) return fail(response, 400, "Enter a valid address");
			updates.address = address;
		}
		if (body.hrStatus !== undefined) {
			if (!["active", "inactive"].includes(body.hrStatus)) {
				return fail(response, 400, "Invalid status");
			}
			updates.hrStatus = body.hrStatus;
		}

		if (!Object.keys(updates).length) {
			return fail(response, 400, "No supported fields were provided");
		}
		await doctorModel.findByIdAndUpdate(id, { $set: updates }, { runValidators: true });
		const updated = await doctorModel.findById(id).select("-password");
		response.json({
			success: true,
			message: "Staff member updated",
			staff: publicStaff(updated),
		});
	} catch (error) {
		console.error(error);
		return fail(response, 500, "Could not update staff member");
	}
};

/** Deactivates/reactivates staff. Never deletes the underlying doctor record. */
const setStaffStatus = async (request, response) => {
	const id = idString(request.params.id);
	const { status } = request.body || {};
	if (!id || !["active", "inactive"].includes(status)) {
		return fail(response, 400, "Invalid status");
	}
	try {
		const doctor = await doctorModel.findByIdAndUpdate(
			id,
			{ $set: { hrStatus: status } },
			{ new: true }
		);
		if (!doctor) return fail(response, 404, "Staff member not found");
		response.json({
			success: true,
			message: status === "active" ? "Staff member reactivated" : "Staff member deactivated",
			staff: publicStaff(doctor),
		});
	} catch (error) {
		console.error(error);
		return fail(response, 500, "Could not update status");
	}
};

// ---- Departments and role labels -----------------------------------------

const listDepartments = async (_request, response) => {
	try {
		const departments = await hrDepartmentModel.find({}).sort({ name: 1 });
		response.json({ success: true, departments });
	} catch {
		return fail(response, 500, "Could not load departments");
	}
};

const addDepartment = async (request, response) => {
	const name = text(request.body?.name, 80, { required: true });
	if (!name) return fail(response, 400, "Department name is required");
	try {
		if (
			await hrDepartmentModel.findOne({
				name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
			})
		) {
			return fail(response, 409, "That department already exists");
		}
		const department = await hrDepartmentModel.create({
			name,
			description: text(request.body.description, 300) || "",
			head: text(request.body.head, 120) || "",
		});
		response.status(201).json({ success: true, department });
	} catch {
		return fail(response, 500, "Could not add department");
	}
};

const updateDepartment = async (request, response) => {
	const id = idString(request.params.id);
	if (!id) return fail(response, 400, "Invalid department id");
	try {
		const department = await hrDepartmentModel.findById(id);
		if (!department) return fail(response, 404, "Department not found");
		const body = request.body || {};
		if (body.name !== undefined) {
			const name = text(body.name, 80, { required: true });
			if (!name) return fail(response, 400, "Department name is required");
			const taken = await hrDepartmentModel.findOne({
				_id: { $ne: id },
				name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
			});
			if (taken) return fail(response, 409, "That department already exists");
			if (name !== department.name) {
				// Keep staff records in sync when a department is renamed.
				await doctorModel.updateMany(
					{ department: department.name },
					{ $set: { department: name } }
				);
				await hrPayrunModel.updateMany(
					{ department: department.name },
					{ $set: { department: name } }
				);
			}
			department.name = name;
		}
		if (body.description !== undefined) {
			const value = text(body.description, 300);
			if (value === null) return fail(response, 400, "Invalid description");
			department.description = value || "";
		}
		if (body.head !== undefined) {
			const value = text(body.head, 120);
			if (value === null) return fail(response, 400, "Invalid head");
			department.head = value || "";
		}
		await department.save();
		response.json({ success: true, department });
	} catch {
		return fail(response, 500, "Could not update department");
	}
};

const deleteDepartment = async (request, response) => {
	const id = idString(request.params.id);
	if (!id) return fail(response, 400, "Invalid department id");
	try {
		const department = await hrDepartmentModel.findById(id);
		if (!department) return fail(response, 404, "Department not found");
		const inUse = await doctorModel.countDocuments({ department: department.name });
		if (inUse) {
			return fail(response, 409, "Reassign staff from this department first");
		}
		await hrDepartmentModel.deleteOne({ _id: id });
		response.json({ success: true, message: "Department removed" });
	} catch {
		return fail(response, 500, "Could not remove department");
	}
};

const listRoles = async (_request, response) => {
	try {
		const roles = await hrRoleModel.find({}).sort({ label: 1 });
		response.json({ success: true, roles });
	} catch {
		return fail(response, 500, "Could not load roles");
	}
};

const addRole = async (request, response) => {
	const label = text(request.body?.label, 120, { required: true });
	if (!label) return fail(response, 400, "Role label is required");
	try {
		const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		if (
			await hrRoleModel.findOne({
				label: { $regex: new RegExp(`^${escaped}$`, "i") },
			})
		) {
			return fail(response, 409, "That role label already exists");
		}
		const role = await hrRoleModel.create({
			label,
			department: text(request.body.department, 80) || "",
			description: text(request.body.description, 300) || "",
		});
		response.status(201).json({ success: true, role });
	} catch {
		return fail(response, 500, "Could not add role");
	}
};

const updateRole = async (request, response) => {
	const id = idString(request.params.id);
	if (!id) return fail(response, 400, "Invalid role id");
	try {
		const role = await hrRoleModel.findById(id);
		if (!role) return fail(response, 404, "Role not found");
		const body = request.body || {};
		if (body.label !== undefined) {
			const label = text(body.label, 120, { required: true });
			if (!label) return fail(response, 400, "Role label is required");
			const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			if (
				await hrRoleModel.findOne({
					_id: { $ne: id },
					label: { $regex: new RegExp(`^${escaped}$`, "i") },
				})
			) {
				return fail(response, 409, "That role label already exists");
			}
			if (label !== role.label) {
				await doctorModel.updateMany(
					{ specialty: role.label },
					{ $set: { specialty: label } }
				);
				await doctorModel.updateMany(
					{ hrRole: role.label },
					{ $set: { hrRole: label } }
				);
			}
			role.label = label;
		}
		for (const key of ["department", "description"]) {
			if (body[key] !== undefined) {
				const max = key === "department" ? 80 : 300;
				const value = text(body[key], max);
				if (value === null) return fail(response, 400, `Invalid ${key}`);
				role[key] = value || "";
			}
		}
		await role.save();
		response.json({ success: true, role });
	} catch {
		return fail(response, 500, "Could not update role");
	}
};

const deleteRole = async (request, response) => {
	const id = idString(request.params.id);
	if (!id) return fail(response, 400, "Invalid role id");
	try {
		const role = await hrRoleModel.findById(id);
		if (!role) return fail(response, 404, "Role not found");
		const inUse = await doctorModel.countDocuments({
			$or: [{ specialty: role.label }, { hrRole: role.label }],
		});
		if (inUse) return fail(response, 409, "Reassign staff from this role first");
		await hrRoleModel.deleteOne({ _id: id });
		response.json({ success: true, message: "Role removed" });
	} catch {
		return fail(response, 500, "Could not remove role");
	}
};

// ---- Payroll --------------------------------------------------------------

const listPayruns = async (_request, response) => {
	try {
		const payruns = await hrPayrunModel
			.find({})
			.sort({ createdAt: -1 })
			.limit(300);
		response.json({ success: true, payruns });
	} catch {
		return fail(response, 500, "Could not load payroll history");
	}
};

/** Demo pay run: derives each pay line from the staff member's rate. */
const runPayroll = async (request, response) => {
	try {
		const body = request.body || {};
		const period = text(body.period, 20, { required: true });
		if (!period || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
			return fail(response, 400, "Choose a period in YYYY-MM format");
		}
		const note = text(body.note, 300) || "";
		const requested = Array.isArray(body.staffIds)
			? body.staffIds.filter(idString)
			: [];
		const query = requested.length
			? { _id: { $in: requested } }
			: { hrStatus: "active" };
		const staff = await doctorModel.find(query);
		if (!staff.length) return fail(response, 400, "No staff selected for this pay run");

		const created = [];
		for (const member of staff) {
			const amount = Math.round((Number(member.fees) || 0) * 4 * 100) / 100;
			const existing = await hrPayrunModel.findOne({
				staffId: member._id.toString(),
				period,
			});
			if (existing) {
				existing.amount = amount;
				existing.department = member.department || "";
				existing.status = "processed";
				existing.paymentDate = today();
				if (note) existing.note = note;
				await existing.save();
				created.push(existing);
			} else {
				created.push(
					await hrPayrunModel.create({
						staffId: member._id.toString(),
						staffName: member.name,
						department: member.department || "",
						period,
						amount,
						status: "processed",
						paymentDate: today(),
						note,
					})
				);
			}
		}
		response.status(201).json({
			success: true,
			message: `Payroll run for ${created.length} staff member${created.length === 1 ? "" : "s"}`,
			payruns: created,
			total: created.reduce((sum, p) => sum + (p.amount || 0), 0),
		});
	} catch (error) {
		console.error(error);
		return fail(response, 500, "Could not run payroll");
	}
};

// ---- Performance notes ----------------------------------------------------

const listNotes = async (request, response) => {
	try {
		const query = {};
		const staffId = idString(request.query.staffId);
		if (staffId) query.staffId = staffId;
		const notes = await hrNoteModel.find(query).sort({ createdAt: -1 }).limit(300);
		response.json({ success: true, notes });
	} catch {
		return fail(response, 500, "Could not load performance notes");
	}
};

const addNote = async (request, response) => {
	try {
		const body = request.body || {};
		const staffId = idString(body.staffId);
		const author = text(body.author, 120, { required: true }) || "Administrator";
		const noteText = text(body.text, 2000, { required: true });
		if (!staffId || !noteText) {
			return fail(response, 400, "Select a staff member and enter a note");
		}
		const doctor = await doctorModel.findById(staffId).select("name");
		if (!doctor) return fail(response, 404, "Staff member not found");
		const note = await hrNoteModel.create({
			staffId,
			staffName: doctor.name,
			author,
			text: noteText,
			date: text(body.date, 40) || today(),
		});
		response.status(201).json({ success: true, message: "Note added", note });
	} catch {
		return fail(response, 500, "Could not add note");
	}
};

// ---- Time off (shares the existing Schedule request collection) -----------

const listTimeOff = async (_request, response) => {
	try {
		const requests = await scheduleRequestModel
			.find({ type: "time-off" })
			.sort({ createdAt: -1 });
		response.json({
			success: true,
			requests: requests.map((item) => ({
				...item.toObject(),
				id: item._id.toString(),
			})),
		});
	} catch {
		return fail(response, 500, "Could not load time-off requests");
	}
};

/** Approves/denies a request in the same collection the staff portal reads. */
const reviewTimeOff = async (request, response) => {
	const id = idString(request.params.id);
	const { status } = request.body || {};
	if (!id || !["approved", "declined"].includes(status)) {
		return fail(response, 400, "Invalid status");
	}
	try {
		const updated = await scheduleRequestModel.findByIdAndUpdate(
			id,
			{ $set: { status } },
			{ new: true }
		);
		if (!updated) return fail(response, 404, "Request not found");
		response.json({ success: true, status, message: `Request ${status}` });
	} catch {
		return fail(response, 400, "Could not update request");
	}
};

/** Small header stats for the HR landing area. */
const summary = async (_request, response) => {
	try {
		const [staff, activeStaff, departments, roles, pending, paid, notes] =
			await Promise.all([
				doctorModel.countDocuments({}),
				doctorModel.countDocuments({ hrStatus: "active" }),
				hrDepartmentModel.countDocuments({}),
				hrRoleModel.countDocuments({}),
				scheduleRequestModel.countDocuments({ type: "time-off", status: "pending" }),
				hrPayrunModel.aggregate([
					{ $group: { _id: null, total: { $sum: "$amount" } } },
				]),
				hrNoteModel.countDocuments({}),
			]);
		response.json({
			success: true,
			summary: {
				staff,
				activeStaff,
				departments,
				roles,
				pendingTimeOff: pending,
				payrollTotal: paid[0]?.total || 0,
				notes,
			},
		});
	} catch {
		return fail(response, 500, "Could not load HR summary");
	}
};

export {
	listStaff,
	staffDetail,
	addStaff,
	updateStaff,
	setStaffStatus,
	listDepartments,
	addDepartment,
	updateDepartment,
	deleteDepartment,
	listRoles,
	addRole,
	updateRole,
	deleteRole,
	listPayruns,
	runPayroll,
	listNotes,
	addNote,
	listTimeOff,
	reviewTimeOff,
	summary,
};
