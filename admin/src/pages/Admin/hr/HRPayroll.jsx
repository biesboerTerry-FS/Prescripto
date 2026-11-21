import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { HRContext } from "../../../context/HRContext";
import { formatHRDate, formatMoney } from "../../../lib/hrData";

const defaultPeriod = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/** Read-only pay-run history plus a clearly labelled demo pay-run action. */
const HRPayroll = () => {
	const { staff, payroll, summary, runPayroll } = useContext(HRContext);
	const [period, setPeriod] = useState(defaultPeriod);
	const [staffId, setStaffId] = useState("all");
	const [note, setNote] = useState("");
	const [busy, setBusy] = useState(false);

	const total = payroll.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

	const handleRun = async (event) => {
		event.preventDefault();
		if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
			return toast.error("Choose a valid pay period.");
		}
		setBusy(true);
		const result = await runPayroll({
			period,
			staffIds: staffId === "all" ? [] : [staffId],
			note,
		});
		setBusy(false);
		if (result.success) {
			toast.success(`${result.message}${result.total ? ` · ${formatMoney(result.total)}` : ""}`);
			setNote("");
		} else toast.error(result.message || "Could not run payroll.");
	};

	return (
		<div className="p-5 mx-auto max-w-[1400px]" data-testid="hr-payroll">
			<h1 className="text-2xl font-semibold text-slate-800" data-testid="hr-payroll-heading">
				Payroll
			</h1>
			<p className="mt-1 text-sm text-slate-500">
				Review pay-run history. The run action is a demo — it records a pay line, it does not move money.
			</p>

			<div className="grid gap-4 mt-5 sm:grid-cols-3">
				<div className="p-4 bg-white border border-slate-200 rounded-xl">
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pay runs</p>
					<p className="mt-1 text-2xl font-semibold text-slate-800" data-testid="hr-payrun-count">{payroll.length}</p>
				</div>
				<div className="p-4 bg-white border border-slate-200 rounded-xl">
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total paid (demo)</p>
					<p className="mt-1 text-2xl font-semibold text-slate-800">{formatMoney(total)}</p>
				</div>
				<div className="p-4 bg-white border border-slate-200 rounded-xl">
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active staff</p>
					<p className="mt-1 text-2xl font-semibold text-slate-800">
						{summary?.activeStaff ?? staff.filter((row) => (row.hrStatus || row.status) === "active").length}
					</p>
				</div>
			</div>

			<form
				onSubmit={handleRun}
				className="flex flex-wrap items-end gap-3 p-5 mt-5 bg-white border border-slate-200 rounded-xl"
				data-testid="hr-payroll-form"
			>
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Pay period
					<input
						type="month"
						required
						value={period}
						onChange={(event) => setPeriod(event.target.value)}
						className="block px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-payroll-period"
					/>
				</label>
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Staff member
					<select
						value={staffId}
						onChange={(event) => setStaffId(event.target.value)}
						className="block px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-payroll-staff"
					>
						<option value="all">All active staff</option>
						{staff.map((row) => (
							<option key={String(row.id || row._id)} value={String(row.id || row._id)}>
								{row.name}
							</option>
						))}
					</select>
				</label>
				<label className="flex-1 min-w-[200px] block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Note (optional)
					<input
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="e.g. November pay run"
						className="block w-full px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-payroll-note"
					/>
				</label>
				<button
					type="submit"
					disabled={busy}
					className="px-5 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary-dark disabled:opacity-60"
					data-testid="hr-run-payroll"
				>
					{busy ? "Running…" : "Run payroll (demo)"}
				</button>
			</form>

			<div className="mt-6 overflow-x-auto bg-white border border-slate-200 rounded-xl">
				<table className="w-full text-sm text-left" data-testid="hr-payroll-table">
					<thead className="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">
						<tr>
							<th className="px-4 py-3">Staff</th>
							<th className="px-4 py-3">Department</th>
							<th className="px-4 py-3">Period</th>
							<th className="px-4 py-3">Amount</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Payment date</th>
							<th className="px-4 py-3">Note</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{payroll.map((row) => (
							<tr key={String(row.id || row._id)} data-testid="hr-payroll-row">
								<td className="px-4 py-3 font-medium text-slate-800">{row.staffName}</td>
								<td className="px-4 py-3 text-slate-600">{row.department || "—"}</td>
								<td className="px-4 py-3 text-slate-600">{row.period}</td>
								<td className="px-4 py-3 text-slate-600">{formatMoney(row.amount)}</td>
								<td className="px-4 py-3">
									<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
										row.status === "paid"
											? "bg-teal-50 text-teal-700"
											: row.status === "processed"
												? "bg-blue-50 text-blue-700"
												: "bg-amber-50 text-amber-700"
									}`}>
										{row.status}
									</span>
								</td>
								<td className="px-4 py-3 text-slate-600">{formatHRDate(row.paymentDate)}</td>
								<td className="px-4 py-3 text-slate-500">{row.note || "—"}</td>
							</tr>
						))}
						{payroll.length === 0 && (
							<tr>
								<td colSpan={7} className="px-4 py-10 text-center text-slate-500">No pay runs yet.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default HRPayroll;
