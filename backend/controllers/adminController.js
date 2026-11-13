import validator from "validator";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import adminModel from "../models/adminModel.js";
import { createAdminToken } from "../configs/token.js";

/**
 * Creates a new doctor record with a Cloudinary-hosted photo. Doctors don't log in yet, so a placeholder password hash is stored.
 */
const addDoctor = async (request, response) => {
	try {
		const {
			name,
			email,
			password,
			specialty,
			degree,
			experience,
			about,
			fees,
			address,
		} = request.body;
		const imageFile = request.file;

		//^ Check if all required data is present
		if (
			!name ||
			!email ||
			!specialty ||
			!degree ||
			!experience ||
			!about ||
			!fees ||
			!address
		) {
			return response.json({
				success: false,
				message: "Missing details",
			});
		}

		//^ email format validation
		if (!validator.isEmail(email)) {
			return response.json({
				success: false,
				message: "Please enter a valid email",
			});
		}

		//^ doctors have no login yet, so store an unguessable placeholder hash
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(randomUUID(), salt);

		//^ upload image to cloudinary
		const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
			resource_type: "image",
		});
		const imageURL = imageUpload.secure_url;

		//^ doctor data
		const doctorData = {
			name,
			email,
			image: imageURL,
			password: hashedPassword,
			specialty,
			degree,
			experience,
			about,
			fees,
			address: JSON.parse(address),
			date: Date.now(),
		};

		const newDoctor = new doctorModel(doctorData);
		await newDoctor.save();

		response.json({
			success: true,
			message: "Doctor added",
		});
	} catch (error) {
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Authenticates an admin against the database record or env fallback and returns an admin-scoped JWT.
 */
const loginAdmin = async (request, response) => {
	try {
		const { email, password } = request.body;

		const admin = await adminModel.findOne({ email });
		const dbMatch = admin && (await bcrypt.compare(password, admin.password));
		const envMatch =
			email === process.env.ADMIN_EMAIL &&
			password === process.env.ADMIN_PASSWORD;

		if (dbMatch || envMatch) {
			response.json({
				success: true,
				token: createAdminToken(email),
			});
		} else {
			response.json({
				success: false,
				message: "Invalid credentials",
			});
		}
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Returns the full doctor list for the admin panel (passwords omitted).
 */
const allDoctors = async (request, response) => {
	try {
		const doctors = await doctorModel.find({}).select("-password");
		response.json({
			success: true,
			doctors,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Builds the admin dashboard payload: counts, earnings, recent bookings, and appointments by specialty.
 */
const adminDashboard = async (request, response) => {
	try {
		const [
			doctors,
			availableDoctors,
			patients,
			appointments,
			cancelled,
			revenue,
			latest,
		] = await Promise.all([
			doctorModel.countDocuments({}),
			doctorModel.countDocuments({ available: true }),
			userModel.countDocuments({}),
			appointmentModel.countDocuments({}),
			appointmentModel.countDocuments({ cancelled: true }),
			appointmentModel.aggregate([
				{ $match: { cancelled: false } },
				{ $group: { _id: null, total: { $sum: "$amount" } } },
			]),
			appointmentModel.find({}).sort({ date: -1 }).limit(5),
		]);

		const bySpecialty = await appointmentModel.aggregate([
			{ $match: { cancelled: false } },
			{ $group: { _id: "$doctorData.specialty", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]);

		response.json({
			success: true,
			dashboard: {
				doctors,
				availableDoctors,
				patients,
				appointments,
				cancelled,
				earnings: revenue[0]?.total || 0,
				latest,
				bySpecialty: bySpecialty.map((s) => ({
					specialty: s._id || "Unknown",
					count: s.count,
				})),
			},
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Returns every appointment in the system, newest first, for the admin appointments view.
 */
const allAppointments = async (request, response) => {
	try {
		const appointments = await appointmentModel
			.find({})
			.sort({ date: -1 });
		response.json({
			success: true,
			appointments,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Cancels an appointment on behalf of a patient/admin and frees the doctor's time slot.
 */
const adminCancelAppointment = async (request, response) => {
	try {
		const { appointmentId } = request.body;
		const appointmentData = await appointmentModel.findById(appointmentId);
		if (!appointmentData) {
			return response.json({
				success: false,
				message: "Appointment not found",
			});
		}
		if (appointmentData.cancelled) {
			return response.json({
				success: false,
				message: "Appointment already cancelled",
			});
		}
		await appointmentModel.findByIdAndUpdate(appointmentId, {
			cancelled: true,
		});

		const { doctorId, slotDate, slotTime } = appointmentData;
		const doctorData = await doctorModel.findById(doctorId);
		if (doctorData) {
			const slots_booked = doctorData.slots_booked || {};
			if (slots_booked[slotDate]) {
				slots_booked[slotDate] = slots_booked[slotDate].filter(
					(e) => e !== slotTime
				);
			}
			await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });
		}

		response.json({
			success: true,
			message: "Appointment cancelled",
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Lists all patients with aggregate booking counts so the admin can see activity at a glance.
 */
const allPatients = async (request, response) => {
	try {
		const [patients, counts] = await Promise.all([
			userModel.find({}).select("-password").sort({ _id: -1 }),
			appointmentModel.aggregate([
				{
					$group: {
						_id: "$userId",
						total: { $sum: 1 },
						active: {
							$sum: { $cond: [{ $eq: ["$cancelled", false] }, 1, 0] },
						},
					},
				},
			]),
		]);
		const countById = Object.fromEntries(counts.map((c) => [c._id, c]));
		response.json({
			success: true,
			patients: patients.map((p) => ({
				...p.toObject(),
				bookings: countById[p._id.toString()]?.total || 0,
				activeBookings: countById[p._id.toString()]?.active || 0,
			})),
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Fetches a single patient's profile, appointment history, and summary stats for the admin detail view.
 */
const patientDetails = async (request, response) => {
	try {
		const { patientId } = request.params;
		const patient = await userModel.findById(patientId).select("-password");
		if (!patient) {
			return response.json({
				success: false,
				message: "Patient not found",
			});
		}
		const appointments = await appointmentModel
			.find({ userId: patientId })
			.sort({ date: -1 });

		const active = appointments.filter((a) => !a.cancelled);
		const stats = {
			total: appointments.length,
			cancelled: appointments.length - active.length,
			paid: active.filter((a) => a.payment).length,
			spent: active.reduce((sum, a) => sum + (a.amount || 0), 0),
		};

		response.json({
			success: true,
			patient,
			appointments,
			stats,
		});
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

export {
	addDoctor,
	loginAdmin,
	allDoctors,
	adminDashboard,
	allAppointments,
	adminCancelAppointment,
	allPatients,
	patientDetails,
};
