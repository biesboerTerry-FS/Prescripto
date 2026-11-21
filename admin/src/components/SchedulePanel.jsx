import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../lib/api";
import {
	formatDate,
	getLocalRequests,
	mergeById,
	saveLocalRequest,
	updateLocalRequestStatus,
	usePortalData,
} from "../lib/portalData";

const mapRequest = (request) => ({
	...request,
	id: request._id || request.id,
	createdAt: request.createdAt || new Date().toISOString(),
});

const RequestList = ({ requests, onReview }) => (
	<ul className="divide-y divide-slate-100">
		{requests.map((request) => (
			<li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
				<div className="min-w-0">
					<p className="text-sm font-medium text-slate-800">
						{request.type === "time-off" ? "Time off" : "Schedule change"} · {request.date}
					</p>
					<p className="mt-0.5 text-xs text-slate-500">
						{request.requester} · {request.reason || "No reason given"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span
						className={`px-2 py-0.5 text-xs font-medium rounded-full ${
							request.status === "approved"
								? "bg-teal-50 text-teal-700"
								: request.status === "declined"
									? "bg-red-50 text-red-700"
									: "bg-amber-50 text-amber-700"
						}`}
					>
						{request.status || "pending"}
					</span>
					{onReview && request.status === "pending" && (
						<>
							<button
								type="button"
								onClick={() => onReview(request, "approved")}
								className="px-2 py-1 text-xs font-medium text-teal-700 border border-teal-200 rounded-md hover:bg-teal-600 hover:text-white"
							>
								Approve
							</button>
							<button
								type="button"
								onClick={() => onReview(request, "declined")}
								className="px-2 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-600 hover:text-white"
							>
								Decline
							</button>
						</>
					)}
				</div>
			</li>
		))}
		{requests.length === 0 && (
			<li className="py-6 text-sm text-center text-slate-500">Nothing here yet.</li>
		)}
	</ul>
);

/** Schedule view: bookings, requests, time off and availability. */
const SchedulePanel = ({ role, appointments = [], availability, onToggleAvailability, requesterName }) => {
	const version = usePortalData();
	const [requests, setRequests] = useState(() => getLocalRequests(role));
	const [form, setForm] = useState({ type: "time-off", date: "", reason: "" });

	useEffect(() => {
		setRequests(getLocalRequests(role));
	}, [role, version]);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const { data } = await api.get("/portal/schedule-requests");
				if (active && data?.success && Array.isArray(data.requests) && data.requests.length) {
					setRequests((local) => mergeById(data.requests.map(mapRequest), local));
				}
			} catch {
				// Offline demo — seeded local requests remain visible.
			}
		})();
		return () => {
			active = false;
		};
	}, [role]);

	const submitRequest = async (event) => {
		event.preventDefault();
		if (!form.date) {
			toast.error("Please choose a date.");
			return;
		}
		const request = {
			id: `local-req-${Date.now()}`,
			type: form.type,
			date: form.date,
			reason: form.reason.trim(),
			requester: requesterName || (role === "admin" ? "Administrator" : "Staff member"),
			status: "pending",
			role,
			createdAt: new Date().toISOString(),
		};
		saveLocalRequest(request);
		setForm({ type: "time-off", date: "", reason: "" });
		toast.success("Request submitted.");
		try {
			await api.post("/portal/schedule-requests", {
				type: request.type,
				date: request.date,
				reason: request.reason,
				requester: request.requester,
			});
		} catch {
			// Local fallback keeps the submission visible.
		}
	};

	const review = async (request, status) => {
		updateLocalRequestStatus(request.id, status);
		try {
			await api.patch(`/portal/schedule-requests/${request.id}`, { status });
		} catch {
			// Local change is enough for offline demo rows.
		}
		toast.success(`Request ${status}.`);
	};

	const upcoming = (appointments || []).filter((item) => !item.cancelled).slice(0, 6);
	const scheduleChanges = requests.filter((r) => r.type !== "time-off");
	const timeOff = requests.filter((r) => r.type === "time-off");

	return (
		<div className="space-y-5">
			<section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
				<h2 className="text-lg font-semibold text-slate-800" data-testid="schedule-heading">
					Schedule
				</h2>
				<p className="mt-0.5 text-sm text-slate-500">Upcoming appointments and availability.</p>
				<ul className="mt-4 divide-y divide-slate-100">
					{upcoming.map((item, index) => (
						<li key={item._id || index} className="flex items-center justify-between py-3 text-sm">
							<span className="text-slate-700">{item.slotDate} · {item.slotTime}</span>
							<span className="text-slate-600">
								{item.userData?.name || "Patient"} · {item.doctorData?.name || "Doctor"}
							</span>
						</li>
					))}
					{upcoming.length === 0 && (
						<li className="py-6 text-sm text-center text-slate-500">No upcoming appointments.</li>
					)}
				</ul>
				{role === "staff" && onToggleAvailability && (
					<div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
						<div>
							<p className="text-sm font-medium text-slate-800">Availability</p>
							<p className="text-xs text-slate-500">Let patients know when you can take bookings.</p>
						</div>
						<button
							type="button"
							onClick={onToggleAvailability}
							data-testid="schedule-availability"
							className={`px-4 py-2 text-sm font-medium text-white rounded-full ${
								availability ? "bg-teal-600" : "bg-slate-500"
							}`}
						>
							{availability ? "Available for bookings" : "Currently unavailable"}
						</button>
					</div>
				)}
			</section>

			<section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
				<h3 className="text-base font-semibold text-slate-800">Schedule requests</h3>
				{role === "staff" && (
					<form onSubmit={submitRequest} className="grid gap-3 mt-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
						<label className="text-sm text-slate-600">
							Type
							<select
								aria-label="Request type"
								value={form.type}
								onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
								className="w-full px-2 py-2 mt-1 border border-slate-300 rounded-md"
							>
								<option value="time-off">Time off</option>
								<option value="schedule-change">Schedule change</option>
							</select>
						</label>
						<label className="text-sm text-slate-600">
							Date
							<input
								aria-label="Request date"
								type="date"
								required
								value={form.date}
								onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
								className="w-full px-2 py-2 mt-1 border border-slate-300 rounded-md"
							/>
						</label>
						<label className="text-sm text-slate-600">
							Reason
							<input
								aria-label="Request reason"
								maxLength={500}
								value={form.reason}
								onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
								className="w-full px-2 py-2 mt-1 border border-slate-300 rounded-md"
							/>
						</label>
						<button type="submit" className="px-4 py-2 text-sm text-white rounded-md bg-primary">
							Submit request
						</button>
					</form>
				)}
				<div className="mt-3">
					<RequestList requests={scheduleChanges} onReview={role === "admin" ? review : null} />
				</div>
			</section>

			<section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
				<h3 className="text-base font-semibold text-slate-800">Time off requests</h3>
				<div className="mt-3">
					<RequestList requests={timeOff} onReview={role === "admin" ? review : null} />
				</div>
			</section>
		</div>
	);
};

export default SchedulePanel;
