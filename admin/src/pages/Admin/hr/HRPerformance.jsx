import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { HRContext } from "../../../context/HRContext";
import { formatHRDate } from "../../../lib/hrData";

/** Per-staff performance notes with an add form and a staff filter. */
const HRPerformance = () => {
	const { staff, notes, addNote } = useContext(HRContext);
	const [staffId, setStaffId] = useState("all");
	const [author, setAuthor] = useState("Administrator");
	const [text, setText] = useState("");
	const idOf = (row) => String(row.id || row._id);

	const visible = notes.filter(
		(row) => staffId === "all" || String(row.staffId) === staffId
	);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (staffId === "all") return toast.error("Select a staff member first.");
		if (!text.trim()) return toast.error("Enter a note.");
		const result = await addNote({
			staffId,
			author: author.trim() || "Administrator",
			text: text.trim(),
		});
		if (result.success) {
			toast.success(result.message);
			setText("");
		} else toast.error(result.message || "Could not add note.");
	};

	return (
		<div className="p-5 mx-auto max-w-[1400px]" data-testid="hr-performance">
			<h1 className="text-2xl font-semibold text-slate-800" data-testid="hr-performance-heading">
				Performance notes
			</h1>
			<p className="mt-1 text-sm text-slate-500">
				A private admin log of feedback, achievements and follow-ups for each staff member.
			</p>

			<form
				onSubmit={handleSubmit}
				className="grid gap-4 mt-5 p-5 bg-white border border-slate-200 rounded-xl md:grid-cols-[220px_200px_1fr_auto] md:items-end"
				data-testid="hr-note-form"
			>
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Staff member
					<select
						required
						value={staffId}
						onChange={(event) => setStaffId(event.target.value)}
						className="block w-full px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-note-staff"
					>
						<option value="all">Select staff…</option>
						{staff.map((row) => (
							<option key={idOf(row)} value={idOf(row)}>{row.name}</option>
						))}
					</select>
				</label>
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Author
					<input
						value={author}
						onChange={(event) => setAuthor(event.target.value)}
						className="block w-full px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-note-author"
					/>
				</label>
				<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
					Note
					<textarea
						rows={2}
						value={text}
						onChange={(event) => setText(event.target.value)}
						placeholder="What happened, and what should happen next?"
						className="block w-full px-3 py-2 mt-1 text-sm font-normal border border-slate-300 rounded-lg"
						data-testid="hr-note-text"
					/>
				</label>
				<button
					type="submit"
					className="px-5 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary-dark"
					data-testid="hr-add-note"
				>
					Add note
				</button>
			</form>

			<div className="mt-6">
				<h2 className="text-lg font-semibold text-slate-800">Note history</h2>
				<ul className="mt-3 space-y-3" data-testid="hr-notes-list">
					{visible.map((row) => (
						<li key={idOf(row)} className="p-4 bg-white border border-slate-200 rounded-xl" data-testid="hr-note-row">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<p className="text-sm font-medium text-slate-800">
									{row.staffName || "Staff member"} <span className="font-normal text-slate-400">· {row.author}</span>
								</p>
								<p className="text-xs text-slate-500">{formatHRDate(row.date || row.createdAt)}</p>
							</div>
							<p className="mt-2 text-sm text-slate-600">{row.text}</p>
						</li>
					))}
					{visible.length === 0 && (
						<li className="py-10 text-center text-sm text-slate-500">No notes yet for this view.</li>
					)}
				</ul>
			</div>
		</div>
	);
};

export default HRPerformance;
