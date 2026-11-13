import validator from "validator";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import userModel from "../models/userModel.js";
import { createToken } from "../configs/token.js";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

/**
 * Registers a new patient account, hashes the password, and returns a JWT on success.
 */
const registerUser = async (request, response) => {
	try {
		const { name, email, password } = request.body;
		if (!name || !email || !password) {
			return response.json({
				success: false,
				message: "Missing details",
			});
		}
		if (!validator.isEmail(email)) {
			return response.json({
				success: false,
				message: "Missing details",
			});
		}
		if (password.length < 8) {
			return response.json({
				success: false,
				message: "Please enter a stronger password",
			});
		}

		// ^ hashing user password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const userData = {
			name,
			email,
			password: hashedPassword,
		};

		const newUser = new userModel(userData);
		const user = await newUser.save();

		// ^ create token
		const token = createToken(user._id);

		response.json({
			success: true,
			token,
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
 * Authenticates a patient with email/password and returns a JWT if the credentials match.
 */
const loginUser = async (request, response) => {
	try {
		const { email, password } = request.body;
		const user = await userModel.findOne({ email: email });

		// ^ if no user than this statement is executed
		if (!user) {
			return response.json({
				success: false,
				message: "User not found.",
			});
		}

		//  ^ if user exists this verifies password
		const isMatch = await bcrypt.compare(password, user.password);
		if (isMatch) {
			const token = createToken(user._id);
			response.json({
				success: true,
				token,
			});
		} else {
			response.json({
				success: false,
				message: "Invalid credentials.",
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
 * Returns the authenticated user's profile (without the password hash).
 */
const getProfile = async (request, response) => {
	try {
		const { userId } = request.body;
		const userData = await userModel.findById(userId).select("-password");
		response.json({
			success: true,
			userData,
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
 * Updates profile fields for the authenticated user and, if provided, uploads a new avatar to Cloudinary.
 */
const updateProfile = async (request, response) => {
	try {
		const { userId, name, phone, address, dob, gender } = request.body;
		const imageFile = request.file;

		if (!name || !phone || !dob || !gender) {
			return response.json({
				success: false,
				message: "Data missing",
			});
		}

		await userModel.findByIdAndUpdate(userId, {
			name,
			phone,
			address: JSON.parse(address),
			dob,
			gender,
		});

		if (imageFile) {
			// ^ upload image to cloudinary
			const imageUpload = await cloudinary.uploader.upload(
				imageFile.path,
				{
					resource_type: "image",
				}
			);
			const imageURL = imageUpload.secure_url;
			await userModel.findByIdAndUpdate(userId, {
				image: imageURL,
			});
		}
		response.json({
			success: true,
			message: "Profile updated",
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
 * Books a time slot with a doctor: checks availability, reserves the slot, and stores an appointment record.
 */
const bookAppointment = async (request, response) => {
	try {
		const { userId, doctorId, slotDate, slotTime } = request.body;
		const doctorData = await doctorModel
			.findById(doctorId)
			.select("-password");
		if (!doctorData.available) {
			return response.json({
				success: false,
				message: "Doctor not available",
			});
		}
		let slots_booked = doctorData.slots_booked;
		// ^ checking for slot availability
		if (slots_booked[slotDate]) {
			if (slots_booked[slotDate].includes(slotTime)) {
				return response.json({
					success: false,
					message: "Time slot not available",
				});
			} else {
				slots_booked[slotDate].push(slotTime);
			}
		} else {
			slots_booked[slotDate] = [];
			slots_booked[slotDate].push(slotTime);
		}

		const userData = await userModel.findById(userId).select("-password");

		// ^ remove time slot from doctor schedule
		delete doctorData.slots_booked;

		const appointmentData = {
			userId,
			doctorId,
			userData,
			doctorData,
			amount: doctorData.fees,
			slotTime,
			slotDate,
			date: Date.now(),
		};

		// ^ save appointment data to database
		const newAppointment = new appointmentModel(appointmentData);
		await newAppointment.save();

		// ^ save new slots data to doctorData
		await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });
		response.json({
			success: true,
			message: "Appointment booked",
		});
	} catch (error) {
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Lists all appointments belonging to the authenticated user.
 */
const listAppointments = async (request, response) => {
	try {
		const { userId } = request.body;
		const appointments = await appointmentModel.find({
			userId,
		});
		response.json({
			success: true,
			appointments,
		});
	} catch (error) {
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Cancels a user's own appointment and releases the reserved slot back to the doctor.
 */
const cancelAppointment = async (request, response) => {
	try {
		const { userId, appointmentId } = request.body;
		const appointmentData = await appointmentModel.findById(appointmentId);
		// ^ verify the appointment user
		if (appointmentData.userId !== userId) {
			return response.json({
				success: false,
				message: "Unauthorized action",
			});
		}
		// ^ cancel appointment
		await appointmentModel.findByIdAndUpdate(appointmentId, {
			cancelled: true,
		});
		// ^ remove slot from doctor slots booked
		const { doctorId, slotDate, slotTime } = appointmentData;
		const doctorData = await doctorModel.findById(doctorId);

		let slots_booked = doctorData.slots_booked;
		slots_booked[slotDate] = slots_booked[slotDate].filter(
			(e) => e !== slotTime
		);
		await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });
		response.json({
			success: true,
			message: "Appointment cancelled",
		});
	} catch (error) {
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Signs a user in with a Google ID token: verifies it, finds or creates a local account, and returns our JWT.
 */
const loginOAuth = async (request, response) => {
	try {
		const { idToken } = request.body;
		if (!idToken) {
			return response.json({
				success: false,
				message: "Missing ID token",
			});
		}
		if (!process.env.GOOGLE_CLIENT_ID) {
			return response.json({
				success: false,
				message: "Google sign-in is not configured on the server",
			});
		}
		// GOOGLE_CLIENT_ID may list several client IDs (web, iOS, Android),
		// comma-separated. The token must be issued to one of them.
		const audiences = process.env.GOOGLE_CLIENT_ID.split(",")
			.map((id) => id.trim())
			.filter(Boolean);
		const client = new OAuth2Client();
		const ticket = await client.verifyIdToken({
			idToken,
			audience: audiences,
		});
		const payload = ticket.getPayload();
		const email = payload.email;
		const emailVerified = payload.email_verified;
		const name = payload.name || email.split("@")[0];
		const image = payload.picture || "Not Selected";
		if (!email || !emailVerified) {
			return response.json({
				success: false,
				message: "Google account email is not verified",
			});
		}

		let user = await userModel.findOne({
			$or: [{ email }, { googleId: payload.sub }],
		});
		if (!user) {
			const newUser = new userModel({
				name,
				email,
				image,
				googleId: payload.sub,
				provider: "google",
			});
			user = await newUser.save();
		} else if (!user.googleId) {
			user.googleId = payload.sub;
			user.provider = user.provider || "google";
			await user.save();
		}
		response.json({ success: true, token: createToken(user._id) });
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: "Google sign-in failed",
		});
	}
};

/**
 * Issues a fresh JWT for a user who is already authenticated (token refresh).
 */
const refreshToken = async (request, response) => {
	try {
		const { userId } = request.body;
		const user = await userModel.findById(userId);
		if (!user) {
			return response.json({
				success: false,
				message: "User not found",
			});
		}
		response.json({ success: true, token: createToken(user._id) });
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Signs in to a shared demo Google account for portfolio previews.
 * This avoids requiring real Google OAuth credentials. It's available in development
 * or when ALLOW_DEMO_OAUTH=true, but blocked in production by default.
 */
const demoOAuthLogin = async (request, response) => {
	try {
		const demoAllowed =
			process.env.NODE_ENV !== "production" ||
			process.env.ALLOW_DEMO_OAUTH === "true";
		if (!demoAllowed) {
			return response.status(403).json({
				success: false,
				message: "Demo Google sign-in is not available in production.",
			});
		}

		const email = "google.demo@prescripto.test";
		let user = await userModel.findOne({ email });
		if (!user) {
			user = await userModel.create({
				name: "Google Demo User",
				email,
				image:
					"https://ui-avatars.com/api/?name=Google+Demo&background=0f766e&color=fff",
				googleId: "demo-google-user",
				provider: "google-demo",
			});
		}

		response.json({ success: true, demo: true, token: createToken(user._id) });
	} catch (error) {
		console.log(error);
		response.json({
			success: false,
			message: "Demo Google sign-in failed.",
		});
	}
};

export {
	registerUser,
	loginUser,
	loginOAuth,
	demoOAuthLogin,
	refreshToken,
	getProfile,
	updateProfile,
	bookAppointment,
	listAppointments,
	cancelAppointment,
};
