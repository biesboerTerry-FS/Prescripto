import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

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
			const { data } = await axios.post(
				backendURL + "/api/admin/all-doctors",
				{},
				{ headers: { adminToken } }
			);
			if (data.success) {
				setDoctors(data.doctors);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Helper that change availability.
	const changeAvailability = async (doctorId) => {
		try {
			const { data } = await axios.post(
				backendURL + "/api/admin/change-availability",
				{ doctorId },
				{ headers: { adminToken } }
			);
			if (data.success) {
				toast.success(data.message);
				getAllDoctors();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Helper that get dashboard.
	const getDashboard = async () => {
		try {
			const { data } = await axios.get(
				backendURL + "/api/admin/dashboard",
				{ headers: { adminToken } }
			);
			if (data.success) {
				setDashboard(data.dashboard);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Helper that get all appointments.
	const getAllAppointments = async () => {
		try {
			const { data } = await axios.get(
				backendURL + "/api/admin/appointments",
				{ headers: { adminToken } }
			);
			if (data.success) {
				setAppointments(data.appointments);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Helper that get patients.
	const getPatients = async () => {
		try {
			const { data } = await axios.get(
				backendURL + "/api/admin/patients",
				{ headers: { adminToken } }
			);
			if (data.success) {
				setPatients(data.patients);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Helper that cancel appointment.
	const cancelAppointment = async (appointmentId) => {
		try {
			const { data } = await axios.put(
				backendURL + "/api/admin/cancel-appointment",
				{ appointmentId },
				{ headers: { adminToken } }
			);
			if (data.success) {
				toast.success(data.message);
				getAllAppointments();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
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
