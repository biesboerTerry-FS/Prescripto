import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";

// Helper that formats a money value for display.
const money = (value) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(value || 0);

// Helper that derives a display status from an appointment record.
const statusOf = (item) => {
	if (item.cancelled) return "cancelled";
	if (item.payment) return "paid";
	return "upcoming";
};

// Renders the Status Badge UI.
const StatusBadge = ({ status }) => {
	const styles = {
		cancelled: "text-red-700 bg-red-50",
		paid: "text-teal-700 bg-teal-50",
		upcoming: "text-amber-700 bg-amber-50",
	};
	const labels = { cancelled: "Cancelled", paid: "Paid", upcoming: "Pending" };
	return (
		<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
			{labels[status]}
		</span>
	);
};

// Renders the Field UI.
const Field = ({ label, value }) => (
	<div>
		<p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
		<p className="text-sm text-slate-700">{value || "—"}</p>
	</div>
);

// Renders the Patient Details view.
const PatientDetails = () => {
	const { patientId } = useParams();
	const { backendURL, adminToken, cancelAppointment } = useContext(AdminContext);
	const [data, setData] = useState(null);
	const [notFound, setNotFound] = useState(false);

	// Helper that load.
	const load = async () => {
		try {
			const { data: res } = await axios.get(
				`${backendURL}/api/admin/patients/${patientId}`,
				{ headers: { adminToken } }
			);
			if (res.success) {
				setData(res);
			} else {
				setNotFound(true);
				toast.error(res.message);
			}
		} catch (error) {
			setNotFound(true);
			toast.error(error.message);
		}
	};

	useEffect(() => {
		if (adminToken) {
			load();
		}
	}, [adminToken, patientId]);

	// Helper that cancel and reload.
	const cancelAndReload = async (appointmentId) => {
		await cancelAppointment(appointmentId);
		load();
	};

	if (notFound) {
		return (
			<div className="flex-1 p-5">
				<p className="text-slate-600">Patient not found.</p>
				<Link to="/patients" className="text-sm text-teal-700 underline">
					Back to patients
				</Link>
			</div>
		);
	}
	if (!data) {
		return <div className="flex-1 p-5 text-sm text-slate-500">Loading patient…</div>;
	}

	const { patient, appointments, stats } = data;
	const initials = patient.name?.split(" ").map((w) => w[0]).slice(0, 2).join("");

	return (
		<div className="flex-1 p-5 max-h-[90vh] overflow-y-auto" tabIndex={0}>
			<Link to="/patients" className="text-sm text-teal-700 hover:underline">
				← All patients
			</Link>

			<div className="flex flex-wrap items-center gap-4 mt-4 p-5 bg-white border rounded-xl border-slate-200 shadow-sm">
				<span className="flex items-center justify-center w-16 h-16 text-xl font-semibold rounded-full bg-teal-100 text-teal-800">
					{initials}
				</span>
				<div className="flex-1 min-w-60">
					<h1 className="text-xl font-semibold text-slate-800">{patient.name}</h1>
					<p className="text-sm text-slate-500">{patient.email}</p>
				</div>
				<div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
					<Field label="Phone" value={patient.phone} />
					<Field label="Gender" value={patient.gender} />
					<Field label="Date of birth" value={patient.dob} />
					<Field
						label="Address"
						value={[patient.address?.line1, patient.address?.line2].filter(Boolean).join(", ")}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 mt-4 xl:grid-cols-4">
				{[
					["Total bookings", stats.total],
					["Paid", stats.paid],
					["Cancelled", stats.cancelled],
					["Total spent", money(stats.spent)],
				].map(([label, value]) => (
					<div key={label} className="p-4 bg-white border rounded-xl border-slate-200 shadow-sm">
						<p className="text-2xl font-semibold text-slate-800">{value}</p>
						<p className="text-sm text-slate-500">{label}</p>
					</div>
				))}
			</div>

			<div className="mt-6 overflow-x-auto bg-white border rounded-xl border-slate-200 shadow-sm">
				<div className="px-5 py-4 border-b border-slate-200">
					<p className="font-medium text-slate-800">Appointment history</p>
				</div>
				<table className="w-full text-sm text-left">
					<thead className="text-xs uppercase bg-slate-50 text-slate-500">
						<tr>
							<th className="px-4 py-3 font-medium">Doctor</th>
							<th className="px-4 py-3 font-medium">Date &amp; time</th>
							<th className="px-4 py-3 font-medium">Fee</th>
							<th className="px-4 py-3 font-medium">Status</th>
							<th className="px-4 py-3 font-medium text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{appointments.map((item) => {
							const status = statusOf(item);
							return (
								<tr key={item._id} className="border-t border-slate-100">
									<td className="px-4 py-3">
										<p className="text-slate-800">{item.doctorData.name}</p>
										<p className="text-xs text-slate-500">{item.doctorData.specialty}</p>
									</td>
									<td className="px-4 py-3 text-slate-600">
										{item.slotDate} · {item.slotTime}
									</td>
									<td className="px-4 py-3 text-slate-600">${item.amount}</td>
									<td className="px-4 py-3">
										<StatusBadge status={status} />
									</td>
									<td className="px-4 py-3 text-right">
										{status !== "cancelled" ? (
											<button
												onClick={() => cancelAndReload(item._id)}
												className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-700 hover:text-white transition-colors"
											>
												Cancel
											</button>
										) : (
											<span className="text-xs text-slate-500">—</span>
										)}
									</td>
								</tr>
							);
						})}
						{appointments.length === 0 && (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-slate-500">
									This patient has no bookings yet.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default PatientDetails;
