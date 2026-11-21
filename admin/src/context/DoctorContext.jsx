import { createContext, useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../lib/api";

export const DoctorContext = createContext();

// Demo staff credentials are the seeded doctor credentials. Staff are doctors
// in this app, so one session powers both the doctor and staff self-service views.
const DEMO_STAFF = {
	email: "richard.james@prescripto.com",
	password: "Demo123456",
};

const LOCAL_STAFF_KEY = "prescripto_staff_demo";
const LOCAL_STAFF_MODE = "prescripto_staff_demo_mode";
const LOCAL_STAFF_TOKEN = "demo-staff-session";

// Used only when the API cannot be reached (e.g. offline portfolio demo).
const LOCAL_STAFF_PROFILE = {
	id: "demo-staff",
	name: "Dr. Richard James",
	email: DEMO_STAFF.email,
	phone: "+1 555 0101",
	specialty: "General Physician",
	degree: "MBBS",
	experience: "3 Years",
	address: {
		line1: "17th Cross, Richmond",
		line2: "Circle, Ring Road, London",
	},
	image: "",
	available: true,
	role: "doctor",
};

const isLocalStaff = () => localStorage.getItem(LOCAL_STAFF_MODE) === "true";

const readLocalStaff = () => {
	try {
		const saved = JSON.parse(localStorage.getItem(LOCAL_STAFF_KEY) || "null");
		return saved?.profile ? saved : { profile: LOCAL_STAFF_PROFILE, appointments: [] };
	} catch {
		return { profile: LOCAL_STAFF_PROFILE, appointments: [] };
	}
};

const writeLocalStaff = (profile, appointments) => {
	localStorage.setItem(
		LOCAL_STAFF_KEY,
		JSON.stringify({ profile, appointments: appointments || [] })
	);
};

// Holds the signed-in doctor's JWT and the data shown in the staff/doctor portal.
const DoctorContextProvider = (props) => {
	const [doctorToken, setDoctorTokenState] = useState(
		localStorage.getItem("doctorToken") || ""
	);
	const [doctor, setDoctor] = useState(null);
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(false);

	const setDoctorToken = useCallback((token) => {
		if (token) localStorage.setItem("doctorToken", token);
		else localStorage.removeItem("doctorToken");
		setDoctorTokenState(token || "");
	}, []);

	const logoutDoctor = useCallback(() => {
		localStorage.removeItem("adminToken");
		localStorage.removeItem(LOCAL_STAFF_KEY);
		localStorage.removeItem(LOCAL_STAFF_MODE);
		setDoctorToken("");
		setDoctor(null);
		setAppointments([]);
	}, [setDoctorToken]);

	const loadDoctorData = useCallback(async () => {
		// Offline demo mode: serve the editable local copy instead of the API.
		if (isLocalStaff()) {
			const local = readLocalStaff();
			setDoctor(local.profile);
			setAppointments(local.appointments || []);
			return;
		}
		try {
			const [profileRes, appointmentsRes] = await Promise.all([
				api.get("/doctor/me"),
				api.get("/doctor/appointments"),
			]);
			if (profileRes.data.success) setDoctor(profileRes.data.doctor);
			if (appointmentsRes.data.success)
				setAppointments(appointmentsRes.data.appointments);
		} catch (error) {
			if (error.response?.status === 401) {
				logoutDoctor();
			} else {
				console.error(error);
			}
		}
	}, [logoutDoctor]);

	useEffect(() => {
		if (doctorToken) loadDoctorData();
	}, [doctorToken, loadDoctorData]);

	// Logs a doctor/staff member in. Returns an object the login form can toast.
	// Falls back to a local demo profile when the API is unreachable.
	const loginDoctor = async (email, password) => {
		setLoading(true);
		try {
			const { data } = await api.post(
				"/doctor/login",
				{ email, password },
				{ skipAuthRedirect: true }
			);
			if (data.success && data.token) {
				localStorage.removeItem(LOCAL_STAFF_KEY);
				localStorage.removeItem(LOCAL_STAFF_MODE);
				setDoctorToken(data.token);
				setDoctor(data.doctor || null);
				return { success: true };
			}
			return { success: false, message: data.message || "Invalid credentials" };
		} catch (error) {
			const isDemo =
				String(email || "").trim().toLowerCase() === DEMO_STAFF.email &&
				password === DEMO_STAFF.password;
			if (!error.response && isDemo) {
				const local = readLocalStaff();
				writeLocalStaff(local.profile, local.appointments);
				localStorage.setItem(LOCAL_STAFF_MODE, "true");
				setDoctorToken(LOCAL_STAFF_TOKEN);
				setDoctor(local.profile);
				setAppointments(local.appointments || []);
				return { success: true, local: true };
			}
			return {
				success: false,
				message: getApiErrorMessage(error, "Doctor login failed."),
			};
		} finally {
			setLoading(false);
		}
	};

	const setAvailability = async (available) => {
		if (isLocalStaff()) {
			const local = readLocalStaff();
			const profile = { ...local.profile, available: Boolean(available) };
			writeLocalStaff(profile, local.appointments);
			setDoctor(profile);
			return { success: true, message: "Availability updated" };
		}
		try {
			const { data } = await api.post("/doctor/availability", { available });
			if (data.success) {
				setDoctor((current) =>
					current ? { ...current, available: data.available } : current
				);
				return { success: true, message: "Availability updated" };
			}
			return { success: false, message: data.message };
		} catch (error) {
			return {
				success: false,
				message: getApiErrorMessage(error, "Could not update availability."),
			};
		}
	};

	// Saves only the four basic fields a staff member is allowed to edit.
	const updateDoctorProfile = async (fields) => {
		const allowed = {};
		for (const key of ["name", "email", "phone", "address"]) {
			if (fields[key] !== undefined) allowed[key] = fields[key];
		}

		if (isLocalStaff()) {
			const local = readLocalStaff();
			const profile = {
				...local.profile,
				...allowed,
				address: allowed.address || local.profile.address,
			};
			writeLocalStaff(profile, local.appointments);
			setDoctor(profile);
			return { success: true, message: "Your details were updated" };
		}

		try {
			const { data } = await api.patch("/doctor/me", allowed);
			if (data.success) {
				setDoctor((current) => ({ ...(current || {}), ...data.doctor }));
				return { success: true, message: data.message || "Your details were updated" };
			}
			return { success: false, message: data.message || "Could not save your details." };
		} catch (error) {
			return {
				success: false,
				message: getApiErrorMessage(error, "Could not save your details."),
			};
		}
	};

	const value = {
		doctorToken,
		setDoctorToken,
		doctor,
		appointments,
		loading,
		loginDoctor,
		loadDoctorData,
		logoutDoctor,
		setAvailability,
		updateDoctorProfile,
	};

	return (
		<DoctorContext.Provider value={value}>
			{props.children}
		</DoctorContext.Provider>
	);
};

export default DoctorContextProvider;
