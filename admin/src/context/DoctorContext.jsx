import { createContext, useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../lib/api";

export const DoctorContext = createContext();

// Holds the signed-in doctor's JWT and the data shown in the doctor portal.
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
		setDoctorToken("");
		setDoctor(null);
		setAppointments([]);
	}, [setDoctorToken]);

	const loadDoctorData = useCallback(async () => {
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

	// Logs a doctor in. Returns an object the login form can toast.
	const loginDoctor = async (email, password) => {
		setLoading(true);
		try {
			const { data } = await api.post(
				"/doctor/login",
				{ email, password },
				{ skipAuthRedirect: true }
			);
			if (data.success && data.token) {
				setDoctorToken(data.token);
				setDoctor(data.doctor || null);
				return { success: true };
			}
			return { success: false, message: data.message || "Invalid credentials" };
		} catch (error) {
			return {
				success: false,
				message: getApiErrorMessage(error, "Doctor login failed."),
			};
		} finally {
			setLoading(false);
		}
	};

	const setAvailability = async (available) => {
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
	};

	return (
		<DoctorContext.Provider value={value}>
			{props.children}
		</DoctorContext.Provider>
	);
};

export default DoctorContextProvider;
