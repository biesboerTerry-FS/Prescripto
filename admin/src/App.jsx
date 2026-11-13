import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Patients from "./pages/Admin/Patients";
import PatientDetails from "./pages/Admin/PatientDetails";
import NotFound from "./pages/NotFound";

// Renders the App UI.
const App = () => {
	const { adminToken } = useContext(AdminContext);

	return adminToken ? (
		<div className="bg-[#f8f9fd]">
			<ToastContainer />
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
						<Route path="*" element={<NotFound />} />
					</Routes>
				</ErrorBoundary>
			</div>
		</div>
	) : (
		<>
			<Login />
			<ToastContainer />
		</>
	);
};

export default App;
