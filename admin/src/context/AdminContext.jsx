import { createContext, useState } from "react";
import { toast } from "react-toastify";
import api, { getApiErrorMessage } from "../lib/api";

export const AdminContext = createContext();

// Renders the Admin Context Provider UI.
const AdminContextProvider = (props) => {
	const backendURL = import.meta.env.VITE_BACKEND_URL;
	const [doctors, setDoctors] = useState([]);
	const [dashboard, setDashboard] = useState(null);
	const [appointments, setAppointments] = useState([]);
	const [patients, setPatients] = useState([]);
	const [adminToken, setAdminToken] = useState(
		localStorage.getItem("adminToken")
			? localStorage.getItem("adminToken")
			: ""
	);

	// Helper that get all doctors.
	const getAllDoctors = async () => {
		try {
			const { data } = await api.post("/admin/all-doctors", {});
			if (data.success) {
				setDoctors(data.doctors);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Could not load doctors."));
		}
	};

	// Helper that change availability.
	const changeAvailability = async (doctorId) => {
		try {
			const { data } = await api.post("/admin/change-availability", {
				doctorId,
			});
			if (data.success) {
				toast.success(data.message);
				getAllDoctors();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Could not update availability."));
		}
	};

	// Helper that get dashboard.
	const getDashboard = async () => {
		try {
			const { data } = await api.get("/admin/dashboard");
			if (data.success) {
				setDashboard(data.dashboard);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Could not load dashboard."));
		}
	};

	// Helper that get all appointments.
	const getAllAppointments = async () => {
		try {
			const { data } = await api.get("/admin/appointments");
			if (data.success) {
				setAppointments(data.appointments);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Could not load appointments."));
		}
	};

	// Helper that get patients.
	const getPatients = async () => {
		try {
			const { data } = await api.get("/admin/patients");
			if (data.success) {
				setPatients(data.patients);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Could not load patients."));
		}
	};

	// Helper that cancel appointment.
	const cancelAppointment = async (appointmentId) => {
		try {
			const { data } = await api.put("/admin/cancel-appointment", {
				appointmentId,
			});
			if (data.success) {
				toast.success(data.message);
				getAllAppointments();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Could not cancel appointment."));
		}
	};

	const value = {
		adminToken,
		setAdminToken,
		backendURL,
		doctors,
		getAllDoctors,
		changeAvailability,
		dashboard,
		getDashboard,
		appointments,
		getAllAppointments,
		cancelAppointment,
		patients,
		getPatients,
	};

	return (
		<AdminContext.Provider value={value}>
			{props.children}
		</AdminContext.Provider>
	);
};

export default AdminContextProvider;
