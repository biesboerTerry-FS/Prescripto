import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Demo-mode bulletin module. Announcements are persisted in the browser's
// localStorage (no backend) so portfolio visitors can try the full flow.
export const BULLETIN_STORAGE_KEY = "prescripto-bulletins";
const BULLETIN_CHANGE_EVENT = "prescripto:bulletins-changed";
const DISMISSED_PREFIX = "prescripto-bulletin-dismissed:";

export const BULLETIN_TYPES = ["info", "warning", "promotion"];
const EMPTY_FORM = { title: "", body: "", type: "info", active: true };

const TYPE_STYLES = {
	info: "text-blue-700 bg-blue-50 border-blue-100",
	warning: "text-amber-700 bg-amber-50 border-amber-100",
	promotion: "text-violet-700 bg-violet-50 border-violet-100",
};

const TYPE_LABELS = {
	info: "Info",
	warning: "Warning",
	promotion: "Promotion",
};

const makeId = () =>
	globalThis.crypto?.randomUUID?.() ||
	`bulletin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// A few examples so the module is visible the first time it is opened.
const makeDemoBulletins = () => {
	const day = 24 * 60 * 60 * 1000;
	const ago = (days) => new Date(Date.now() - days * day).toISOString();
	return [
		{
			id: "demo-bulletin-online-booking",
			title: "New online booking flow is live",
			body: "Patients can now confirm appointments in just a few taps. The updated flow is available in the patient app and on the web.",
			type: "info",
			active: true,
			createdAt: ago(1),
		},
		{
			id: "demo-bulletin-holiday-hours",
			title: "Extended clinic hours this month",
			body: "Evening appointments are now available on Tuesdays and Thursdays. Please update your availability if you plan to join them.",
			type: "warning",
			active: true,
			createdAt: ago(3),
		},
		{
			id: "demo-bulletin-checkup-campaign",
			title: "Annual check-up campaign",
			body: "Preventive care packages are now open for booking. Share the offer with patients during their next visit.",
			type: "promotion",
			active: false,
			createdAt: ago(6),
		},
	];
};

const sortNewest = (list) =>
	[...list].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

// Reads all bulletins, seeding demo data only when the key has never been set.
export function getBulletins() {
	try {
		const raw = window.localStorage.getItem(BULLETIN_STORAGE_KEY);
		if (raw === null) {
			const seeded = makeDemoBulletins();
			window.localStorage.setItem(BULLETIN_STORAGE_KEY, JSON.stringify(seeded));
			return seeded;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

const writeBulletins = (list) => {
	try {
		window.localStorage.setItem(BULLETIN_STORAGE_KEY, JSON.stringify(list));
	} catch {
		// Storage may be disabled; keep the UI usable for this session.
	}
	window.dispatchEvent(new Event(BULLETIN_CHANGE_EVENT));
};

// Returns active bulletins, newest first. Used by the dashboard widget.
export function getActiveBulletins() {
	return sortNewest(getBulletins().filter((b) => b.active));
}

// Keeps components in sync with localStorage writes (including other tabs).
export function useBulletins() {
	const [bulletins, setBulletins] = useState(() => getBulletins());

	useEffect(() => {
		const sync = () => setBulletins(getBulletins());
		window.addEventListener(BULLETIN_CHANGE_EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(BULLETIN_CHANGE_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);

	return bulletins;
}

const formatDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

// Reusable coloured type badge.
const TypeBadge = ({ type }) => (
	<span
		className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded-full ${
			TYPE_STYLES[type] || TYPE_STYLES.info
		}`}
	>
		{TYPE_LABELS[type] || "Info"}
	</span>
);

// Saves a bulletin list and notifies any mounted consumers.
const persist = (list, message) => {
	writeBulletins(list);
	if (message) toast.success(message);
};

// Renders the bulletins manager page.
const Announcements = () => {
	const bulletins = useBulletins();
	const [form, setForm] = useState(EMPTY_FORM);
	const [editingId, setEditingId] = useState(null);

	const rows = useMemo(() => sortNewest(bulletins), [bulletins]);

	const setField = (field, value) =>
		setForm((current) => ({ ...current, [field]: value }));

	const startEdit = (bulletin) => {
		setEditingId(bulletin.id);
		setForm({
			title: bulletin.title || "",
			body: bulletin.body || "",
			type: BULLETIN_TYPES.includes(bulletin.type) ? bulletin.type : "info",
			active: Boolean(bulletin.active),
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const resetForm = () => {
		setEditingId(null);
		setForm(EMPTY_FORM);
	};

	const onSubmit = (event) => {
		event.preventDefault();
		const title = form.title.trim();
		const body = form.body.trim();
		if (!title || !body) {
			toast.error("A title and message are required.");
			return;
		}

		if (editingId) {
			const next = bulletins.map((b) =>
				b.id === editingId ? { ...b, title, body, type: form.type, active: form.active } : b
			);
			persist(next, "Bulletin updated.");
		} else {
			const next = [
				{
					id: makeId(),
					title,
					body,
					type: form.type,
					active: form.active,
					createdAt: new Date().toISOString(),
				},
				...bulletins,
			];
			persist(next, "Bulletin published.");
		}
		resetForm();
	};

	const toggleActive = (bulletin) => {
		const next = bulletins.map((b) =>
			b.id === bulletin.id ? { ...b, active: !b.active } : b
		);
		persist(next, bulletin.active ? "Bulletin deactivated." : "Bulletin activated.");
	};

	const removeBulletin = (bulletin) => {
		if (!window.confirm(`Delete "${bulletin.title}"? This cannot be undone.`)) return;
		persist(
			bulletins.filter((b) => b.id !== bulletin.id),
			"Bulletin deleted."
		);
		if (editingId === bulletin.id) resetForm();
	};

	return (
		<div className="flex-1 p-5 max-h-[90vh] overflow-y-auto" tabIndex={0}>
			<h1 className="text-xl font-semibold text-slate-800">Announcements</h1>
			<p className="mt-1 text-sm text-slate-500">
				Post bulletins for the admin team. Active bulletins appear on the dashboard.
			</p>
			<div className="px-3 py-2 mt-3 text-xs rounded-lg bg-teal-50 text-teal-800 border border-teal-100">
				Demo mode: bulletins are saved locally in this browser
				(<code>prescripto-bulletins</code>) and are not shared with other users or devices.
			</div>

			<div className="grid grid-cols-1 gap-6 mt-6 xl:grid-cols-3">
				{/* Create / edit form */}
				<form
					onSubmit={onSubmit}
					className="p-5 bg-white border rounded-xl border-slate-200 shadow-sm h-fit xl:col-span-1"
				>
					<h2 className="font-medium text-slate-800">
						{editingId ? "Edit bulletin" : "Post a bulletin"}
					</h2>
					<p className="mt-1 mb-4 text-xs text-slate-500">
						{editingId ? "Update the details below." : "Share a new announcement with the team."}
					</p>

					<label htmlFor="bulletin-title" className="block text-sm font-medium text-slate-700">
						Title
					</label>
					<input
						id="bulletin-title"
						value={form.title}
						onChange={(e) => setField("title", e.target.value)}
						required
						maxLength={120}
						placeholder="e.g. Clinic closed on Monday"
						className="w-full px-3 py-2 mt-1 text-sm bg-white border rounded-lg border-slate-300 focus:border-teal-500 focus:outline-none"
					/>

					<label htmlFor="bulletin-body" className="block mt-4 text-sm font-medium text-slate-700">
						Message
					</label>
					<textarea
						id="bulletin-body"
						value={form.body}
						onChange={(e) => setField("body", e.target.value)}
						required
						rows={5}
						placeholder="Write the announcement…"
						className="w-full px-3 py-2 mt-1 text-sm bg-white border rounded-lg border-slate-300 focus:border-teal-500 focus:outline-none resize-y"
					/>

					<label htmlFor="bulletin-type" className="block mt-4 text-sm font-medium text-slate-700">
						Type
					</label>
					<select
						id="bulletin-type"
						value={form.type}
						onChange={(e) => setField("type", e.target.value)}
						className="w-full px-3 py-2 mt-1 text-sm bg-white border rounded-lg border-slate-300 focus:border-teal-500 focus:outline-none"
					>
						{BULLETIN_TYPES.map((type) => (
							<option key={type} value={type}>
								{TYPE_LABELS[type]}
							</option>
						))}
					</select>

					<label className="flex items-center gap-2 mt-4 text-sm text-slate-700">
						<input
							type="checkbox"
							checked={form.active}
							onChange={(e) => setField("active", e.target.checked)}
							className="w-4 h-4 accent-teal-600"
						/>
						Active (show on dashboard)
					</label>

					<div className="flex gap-2 mt-5">
						<button
							type="submit"
							className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:opacity-90"
						>
							{editingId ? "Save changes" : "Publish bulletin"}
						</button>
						{editingId && (
							<button
								type="button"
								onClick={resetForm}
								className="px-4 py-2 text-sm font-medium border rounded-md border-slate-300 text-slate-600 hover:bg-slate-50"
							>
								Cancel
							</button>
						)}
					</div>
				</form>

				{/* List */}
				<div className="overflow-hidden bg-white border rounded-xl border-slate-200 shadow-sm xl:col-span-2">
					<div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
						<p className="font-medium text-slate-800">All bulletins</p>
						<span className="text-xs text-slate-500">
							{bulletins.filter((b) => b.active).length} active · {bulletins.length} total
						</span>
					</div>
					{rows.length === 0 && (
						<p className="px-5 py-8 text-sm text-center text-slate-500">
							No bulletins yet. Post one using the form.
						</p>
					)}
					<ul>
						{rows.map((bulletin) => (
							<li key={bulletin.id} className="px-5 py-4 border-b last:border-b-0 border-slate-100">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<p className="font-medium text-slate-800 break-words">{bulletin.title}</p>
											<TypeBadge type={bulletin.type} />
										</div>
										<p className="mt-1 text-sm whitespace-pre-wrap break-words text-slate-600">
											{bulletin.body}
										</p>
										<p className="mt-1 text-xs text-slate-400">
											Posted {formatDate(bulletin.createdAt)}
										</p>
									</div>
									<div className="flex items-center gap-3 shrink-0">
										<label className="flex items-center gap-1.5 text-xs text-slate-600">
											<input
												type="checkbox"
												aria-label={`Active: ${bulletin.title}`}
												checked={Boolean(bulletin.active)}
												onChange={() => toggleActive(bulletin)}
												className="w-4 h-4 accent-teal-600"
											/>
											Active
										</label>
										<button
											type="button"
											onClick={() => startEdit(bulletin)}
											className="px-3 py-1.5 text-xs font-medium text-teal-700 border border-teal-200 rounded-md hover:bg-teal-600 hover:text-white transition-colors"
										>
											Edit
										</button>
										<button
											type="button"
											onClick={() => removeBulletin(bulletin)}
											className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-600 hover:text-white transition-colors"
										>
											Delete
										</button>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

const isDismissed = (id) => {
	try {
		return window.sessionStorage.getItem(`${DISMISSED_PREFIX}${id}`) === "1";
	} catch {
		return false;
	}
};

// Compact dashboard widget showing the newest active bulletin.
export const LatestBulletin = () => {
	const bulletins = useBulletins();
	const latest = useMemo(
		() => sortNewest(bulletins.filter((b) => b.active))[0] || null,
		[bulletins]
	);
	const [dismissed, setDismissed] = useState(() =>
		latest ? isDismissed(latest.id) : false
	);

	useEffect(() => {
		setDismissed(latest ? isDismissed(latest.id) : false);
	}, [latest]);

	if (!latest || dismissed) return null;

	const handleDismiss = () => {
		try {
			window.sessionStorage.setItem(`${DISMISSED_PREFIX}${latest.id}`, "1");
		} catch {
			// Ignore storage restrictions; dismissal still applies this render.
		}
		setDismissed(true);
	};

	return (
		<div className="relative p-4 mt-6 bg-white border rounded-xl border-slate-200 shadow-sm">
			<button
				type="button"
				onClick={handleDismiss}
				aria-label="Dismiss bulletin"
				title="Dismiss for this session"
				className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-lg leading-none"
			>
				×
			</button>
			<div className="flex flex-wrap items-center gap-2 pr-6">
				<span className="text-sm font-medium text-slate-800">Latest bulletin</span>
				<TypeBadge type={latest.type} />
				<span className="text-xs text-slate-400">{formatDate(latest.createdAt)}</span>
			</div>
			<p className="mt-1 text-sm font-medium text-slate-800">{latest.title}</p>
			<p className="mt-0.5 text-sm text-slate-600 line-clamp-2">{latest.body}</p>
			<div className="flex flex-wrap items-center gap-3 mt-2">
				<Link to="/announcements" className="text-xs font-medium text-teal-700 hover:underline">
					Manage bulletins →
				</Link>
				<span className="text-[11px] text-slate-400">Demo data · stored locally</span>
			</div>
		</div>
	);
};

export default Announcements;
