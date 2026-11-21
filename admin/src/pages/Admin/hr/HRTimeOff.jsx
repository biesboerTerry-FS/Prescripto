import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { HRContext } from "../../../context/HRContext";
import { formatHRDate } from "../../../lib/hrData";

const statusClass = (status) =>
	status === "approved"
		? "bg-teal-50 text-teal-700"
		: status === "declined"
			? "bg-red-50 text-red-700"
			: "bg-amber-50 text-amber-700";

/** Admin approval queue. Shares the Schedule/staff-portal request collection. */
const HRTimeOff = () => {
	const { timeOff, summary, reviewTimeOff } = useContext(HRContext);
	const [filter, setFilter] = useState("pending");
	const idOf = (row) => String(row.id || row._id);

	const rows = timeOff.filter((row) => filter === "all" || row.status === filter);
	const pending = timeOff.filter((row) => row.status === "pending");

	const review = async (row, status) => {
		const result = await reviewTimeOff(idOf(row), status);
		if (result.success) toast.success(result.message);
		else toast.error(result.message || "Could not update request.");
	};

	return (
		<div className="p-5 mx-auto max-w-[1400px]" data-testid="hr-timeoff">
			<h1 className="text-2xl font-semibold text-slate-800" data-testid="hr-timeoff-heading">
				Time-off approvals
			</h1>
			<p className="mt-1 text-sm text-slate-500">
				{summary?.pendingTimeOff ?? pending.length} pending request(s). Decisions are reflected in the Schedule page and the staff portal.
			</p>

			<div className="flex items-center gap-3 mt-5">
				<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					Show
					<select
						value={filter}
						onChange={(event) => setFilter(event.target.value)}
						className="block px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-timeoff-filter"
					>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="declined">Declined</option>
						<option value="all">All requests</option>
					</select>
				</label>
			</div>

			<div className="mt-4 overflow-x-auto bg-white border border-slate-200 rounded-xl">
				<table className="w-full text-sm text-left" data-testid="hr-timeoff-table">
					<thead className="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">
						<tr>
							<th className="px-4 py-3">Requester</th>
							<th className="px-4 py-3">Date</th>
							<th className="px-4 py-3">Reason</th>
							<th className="px-4 py-3">Submitted</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{rows.map((row) => (
							<tr key={idOf(row)} data-testid={`hr-timeoff-row-${idOf(row)}`}>
								<td className="px-4 py-3 font-medium text-slate-800">{row.requester}</td>
								<td className="px-4 py-3 text-slate-600">{formatHRDate(row.date)}</td>
								<td className="px-4 py-3 text-slate-600">{row.reason || "—"}</td>
								<td className="px-4 py-3 text-slate-500">{formatHRDate(row.createdAt)}</td>
								<td className="px-4 py-3">
									<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClass(row.status)}`}>
										{row.status}
									</span>
								</td>
								<td className="px-4 py-3">
									{row.status === "pending" ? (
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => review(row, "approved")}
												className="px-3 py-1 text-xs font-medium text-teal-700 border border-teal-200 rounded-md hover:bg-teal-600 hover:text-white"
												data-testid={`hr-timeoff-approve-${idOf(row)}`}
											>
												Approve
											</button>
											<button
												type="button"
												onClick={() => review(row, "declined")}
												className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-600 hover:text-white"
												data-testid={`hr-timeoff-deny-${idOf(row)}`}
											>
												Deny
											</button>
										</div>
									) : (
										<span className="text-xs text-slate-400">Reviewed</span>
									)}
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-10 text-center text-slate-500">No requests in this view.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default HRTimeOff;
