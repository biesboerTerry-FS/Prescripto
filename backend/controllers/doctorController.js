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

export {
	changeAvailability,
	doctorList,
	loginDoctor,
	getDoctorProfile,
	getDoctorAppointments,
	setDoctorAvailability,
};
