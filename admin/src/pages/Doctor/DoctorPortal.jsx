import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";

// Renders the signed-in doctor's own dashboard.
const DoctorPortal = () => {
	const navigate = useNavigate();
	const {
		doctor,
		appointments,
		loadDoctorData,
		logoutDoctor,
		setAvailability,
	} = useContext(DoctorContext);

	const toggleAvailability = async () => {
		const result = await setAvailability(!doctor?.available);
		if (result.success) toast.success(result.message);
		else toast.error(result.message);
	};

	const logout = () => {
		logoutDoctor();
		navigate("/");
	};

	const active = appointments.filter((item) => !item.cancelled);

	return (
		<div className="min-h-screen bg-[#f8f9fd]">
			<div className="flex items-center justify-between border-b bg-white px-4 py-3 sm:px-10">
				<div className="flex items-center gap-2">
					<img className="brand-logo w-36 sm:w-40" src={assets.admin_logo} alt="Prescripto" />
					<span className="rounded-full border border-gray-500 px-2.5 py-0.5 text-xs text-gray-600">
						Doctor
					</span>
				</div>
				<button
					onClick={logout}
					className="rounded-full bg-primary px-8 py-2 text-sm text-white"
				>
					Logout
				</button>
			</div>

			<main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
				<div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
					<img
						className="h-20 w-20 rounded-full bg-slate-100 object-cover"
						src={doctor?.image}
						alt=""
					/>
					<div className="flex-1">
						<h1 className="text-xl font-semibold text-slate-800">
							{doctor?.name || "Doctor portal"}
						</h1>
						<p className="text-sm text-slate-500">
							{doctor?.specialty} · {doctor?.email}
						</p>
						<p className="mt-1 text-xs text-slate-500">
							{doctor?.degree} · {doctor?.experience} experience
						</p>
					</div>
					<button
						onClick={toggleAvailability}
						className={`rounded-full px-5 py-2 text-sm font-medium text-white ${
							doctor?.available ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-500 hover:bg-slate-600"
						}`}
					>
						{doctor?.available ? "Available for bookings" : "Currently unavailable"}
					</button>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-3">
					<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-2xl font-semibold text-slate-800">{appointments.length}</p>
						<p className="text-xs uppercase tracking-wide text-slate-500">Total appointments</p>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-2xl font-semibold text-slate-800">{active.length}</p>
						<p className="text-xs uppercase tracking-wide text-slate-500">Active</p>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-2xl font-semibold text-slate-800">
							${active.reduce((sum, item) => sum + (item.amount || 0), 0)}
						</p>
						<p className="text-xs uppercase tracking-wide text-slate-500">Booked value</p>
					</div>
				</div>

				<div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-800">My appointments</h2>
						<button
							onClick={loadDoctorData}
							className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
						>
							Refresh
						</button>
					</div>
					<div className="mt-4 overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="border-b text-xs uppercase text-slate-500">
								<tr>
									<th className="py-2">Patient</th>
									<th className="py-2">Date &amp; time</th>
									<th className="py-2">Status</th>
								</tr>
							</thead>
							<tbody>
								{appointments.map((item) => (
									<tr key={item._id} className="border-b last:border-0">
										<td className="py-3">
											<p className="font-medium text-slate-800">
												{item.userData?.name || "Patient"}
											</p>
											<p className="text-xs text-slate-500">{item.userData?.email}</p>
										</td>
										<td className="py-3 text-slate-600">
											{item.slotDate} · {item.slotTime}
										</td>
										<td className="py-3">
											<span
												className={`rounded-full px-2 py-1 text-xs ${
													item.cancelled
														? "bg-red-50 text-red-600"
														: item.payment
														? "bg-green-50 text-green-700"
														: "bg-amber-50 text-amber-700"
												}`}
											>
												{item.cancelled ? "Cancelled" : item.payment ? "Paid" : "Pending"}
											</span>
										</td>
									</tr>
								))}
								{appointments.length === 0 && (
									<tr>
										<td colSpan="3" className="py-6 text-center text-slate-500">
											No appointments yet.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
};

export default DoctorPortal;
