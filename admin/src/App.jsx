import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";
import StaffPortal from "./pages/Doctor/StaffPortal";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import Announcements from "./components/Announcements";
import ErrorBoundary from "./components/ErrorBoundary";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Patients from "./pages/Admin/Patients";
import PatientDetails from "./pages/Admin/PatientDetails";
import Orders from "./pages/Admin/Orders";
import Messages from "./pages/Admin/Messages";
import Schedule from "./pages/Admin/Schedule";
import NotFound from "./pages/NotFound";

// Renders the App UI.
const App = () => {
	const { adminToken } = useContext(AdminContext);
	const { doctorToken } = useContext(DoctorContext);

	// A doctor/staff session gets its own scoped routes. There is no path into
	// the admin layout, sidebar, patients, revenue or settings from here.
	if (doctorToken) {
		return (
			<>
				<ErrorBoundary>
					<Routes>
						<Route path="/staff" element={<StaffPortal />} />
						<Route path="/employee" element={<StaffPortal />} />
						<Route path="*" element={<Navigate to="/staff" replace />} />
					</Routes>
				</ErrorBoundary>
				<ToastContainer position="top-right" autoClose={3500} newestOnTop closeOnClick pauseOnHover />
				<Analytics />
				<SpeedInsights />
			</>
		);
	}

	return adminToken ? (
		<div className="bg-[#f8f9fd]">
			<ToastContainer position="top-right" autoClose={3500} newestOnTop closeOnClick pauseOnHover />
			<NavBar />
			<div className="flex items-start">
				<Sidebar />
				<ErrorBoundary>
					<Routes>
						<Route path="/" element={<Navigate to="/admin-dashboard" replace />} />
						<Route path="/admin-dashboard" element={<Dashboard />} />
						<Route
							path="/all-appointments"
							element={<AllAppointments />}
						/>
						<Route path="/add-doctor" element={<AddDoctor />} />
						<Route path="/doctor-list" element={<DoctorsList />} />
						<Route path="/patients" element={<Patients />} />
						<Route path="/patients/:patientId" element={<PatientDetails />} />
						<Route path="/orders" element={<Orders />} />
						<Route path="/messages" element={<Messages />} />
						<Route path="/schedule" element={<Schedule />} />
						<Route path="/announcements" element={<Announcements />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</ErrorBoundary>
			</div>
			<Analytics />
			<SpeedInsights />
		</div>
	) : (
		<>
			<Login />
			<ToastContainer position="top-right" autoClose={3500} newestOnTop closeOnClick pauseOnHover />
			<Analytics />
			<SpeedInsights />
		</>
	);
};

export default App;
