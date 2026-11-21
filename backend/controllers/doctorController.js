import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { createDoctorToken } from "../configs/token.js";

/**
 * Toggles a doctor's availability flag. The admin panel uses this to open/close booking.
 */
const changeAvailability = async (request, response) => {
	try {
		const { doctorId } = request.body;
		const doctorData = await doctorModel.findById(doctorId);

		await doctorModel.findByIdAndUpdate(doctorId, {
			available: !doctorData.available,
		});
		response.json({
			success: true,
			message: "Availability updated",
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
 * Returns the public list of doctors for the patient site, omitting sensitive fields.
 */
const doctorList = async (request, response) => {
	try {
		const doctors = await doctorModel
			.find({})
			.select(["-password", "-email"]);
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
 * Authenticates a doctor with their email/password and returns a doctor-scoped JWT.
 * Seeded demo doctors use the shared DEMO_PASSWORD from seed.js.
 */
const loginDoctor = async (request, response) => {
	try {
		const { email, password } = request.body;
		if (!email || !password) {
			return response.json({
				success: false,
				message: "Email and password are required",
			});
		}

		const doctor = await doctorModel.findOne({ email });
		const passwordMatch = doctor && (await bcrypt.compare(password, doctor.password));
		if (!passwordMatch) {
			return response.json({
				success: false,
				message: "Invalid credentials",
			});
		}

		response.json({
			success: true,
			token: createDoctorToken(doctor._id.toString()),
			doctor: {
				id: doctor._id.toString(),
				name: doctor.name,
				email: doctor.email,
				specialty: doctor.specialty,
				image: doctor.image,
				available: doctor.available,
			},
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

/** Returns the signed-in doctor's public profile. */
const getDoctorProfile = async (request, response) => {
	try {
		const doctor = await doctorModel
			.findById(request.doctorId)
			.select("-password");
		if (!doctor) {
			return response.status(404).json({
				success: false,
				message: "Doctor not found",
			});
		}
		response.json({ success: true, doctor });
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

/** Returns every appointment booked with the signed-in doctor, newest first. */
const getDoctorAppointments = async (request, response) => {
	try {
		const appointments = await appointmentModel
			.find({ doctorId: request.doctorId })
			.sort({ date: -1 });
		response.json({ success: true, appointments });
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

/** Lets a doctor open or close their own booking availability. */
const setDoctorAvailability = async (request, response) => {
	try {
		const { available } = request.body;
		const doctor = await doctorModel.findById(request.doctorId);
		if (!doctor) {
			return response.status(404).json({
				success: false,
				message: "Doctor not found",
			});
		}
		doctor.available = Boolean(available);
		await doctor.save();
		response.json({ success: true, available: doctor.available });
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

/**
 * Lets a doctor update only their own basic contact details from the staff
 * self-service portal. Role, specialization, fees, availability and every other
 * staff record are deliberately off-limits here.
 */
const updateDoctorProfile = async (request, response) => {
	try {
		const { name, email, phone, address } = request.body || {};
		const updates = {};

		if (name !== undefined) {
			if (typeof name !== "string" || !name.trim()) {
				return response.status(400).json({
					success: false,
					message: "Name must be a non-empty string",
				});
			}
			updates.name = name.trim().slice(0, 120);
		}

		if (email !== undefined) {
			if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				return response.status(400).json({
					success: false,
					message: "Enter a valid email address",
				});
			}
			const normalized = email.trim().toLowerCase();
			const taken = await doctorModel.findOne({
				email: normalized,
				_id: { $ne: request.doctorId },
			});
			if (taken) {
				return response.status(409).json({
					success: false,
					message: "That email is already in use",
				});
			}
			updates.email = normalized;
		}

		if (phone !== undefined) {
			if (typeof phone !== "string" || phone.length > 40) {
				return response.status(400).json({
					success: false,
					message: "Enter a valid phone number",
				});
			}
			updates.phone = phone.trim();
		}

		if (address !== undefined) {
			if (!address || typeof address !== "object" || Array.isArray(address)) {
				return response.status(400).json({
					success: false,
					message: "Enter a valid address",
				});
			}
			const current = await doctorModel.findById(request.doctorId).select("address");
			const nextAddress = { ...(current?.address?.toObject?.() || current?.address || {}) };
			for (const key of ["line1", "line2"]) {
				if (address[key] !== undefined) {
					if (typeof address[key] !== "string" || address[key].length > 160) {
						return response.status(400).json({
							success: false,
							message: "Address lines must be short text values",
						});
					}
					nextAddress[key] = address[key].trim();
				}
			}
			updates.address = nextAddress;
		}

		if (!Object.keys(updates).length) {
			return response.status(400).json({
				success: false,
				message: "No supported fields were provided",
			});
		}

		const doctor = await doctorModel
			.findByIdAndUpdate(request.doctorId, { $set: updates }, { new: true, runValidators: true })
			.select("-password");
		if (!doctor) {
			return response.status(404).json({
				success: false,
				message: "Doctor not found",
			});
		}

		response.json({
			success: true,
			message: "Your details were updated",
			doctor: {
				id: doctor._id.toString(),
				name: doctor.name,
				email: doctor.email,
				phone: doctor.phone || "",
				address: doctor.address,
				specialty: doctor.specialty,
				available: doctor.available,
			},
		});
	} catch (error) {
		console.log(error);
		response.json({ success: false, message: error.message });
	}
};

export {
	changeAvailability,
	doctorList,
	loginDoctor,
	getDoctorProfile,
	getDoctorAppointments,
	setDoctorAvailability,
	updateDoctorProfile,
};
