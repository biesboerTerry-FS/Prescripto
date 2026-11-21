import { useEffect, useState } from "react";

// Local persistence for the shared admin/staff portal features. The API is the
// source of truth when reachable; localStorage keeps the portfolio demo working
// offline and immediately after a status change or request submission.

export const ORDERS_KEY = "prescripto-orders";
export const MESSAGES_KEY = "prescripto-messages";
export const SCHEDULE_KEY = "prescripto-schedule-requests";
const CHANGE_EVENT = "prescripto:portal-changed";

export const ORDER_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];
export const STATUS_LABELS = {
	pending: "Pending",
	confirmed: "Confirmed",
	in_progress: "In progress",
	completed: "Completed",
	cancelled: "Cancelled",
};

const emitChange = () => {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event(CHANGE_EVENT));
	}
};

// Re-renders consumers whenever this tab or another tab writes portal data.
export function usePortalData() {
	const [version, setVersion] = useState(0);
	useEffect(() => {
		const sync = () => setVersion((v) => v + 1);
		window.addEventListener(CHANGE_EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(CHANGE_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	return version;
}

const readList = (key, seedFn) => {
	try {
		const raw = localStorage.getItem(key);
		if (raw === null) {
			const seeded = seedFn();
			localStorage.setItem(key, JSON.stringify(seeded));
			return seeded;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return seedFn();
	}
};

const writeList = (key, list) => {
	try {
		localStorage.setItem(key, JSON.stringify(list));
	} catch {
		// Storage can be disabled; the current session still works.
	}
	emitChange();
};

const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();
const daysAhead = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const demoOrders = () => [
	{
		id: "demo-order-1042",
		patient: "Demo Patient",
		items: [{ name: "General consultation", qty: 1 }],
		total: 50,
		date: daysAgo(1).slice(0, 10),
		status: "pending",
		doctorId: null,
		source: "demo",
	},
	{
		id: "demo-order-1041",
		patient: "Sarah Thompson",
		items: [{ name: "Dermatology follow-up", qty: 1 }],
		total: 80,
		date: daysAgo(2).slice(0, 10),
		status: "confirmed",
		doctorId: null,
		source: "demo",
	},
	{
		id: "demo-order-1040",
		patient: "James Carter",
		items: [{ name: "Cardiology check-up", qty: 1 }],
		total: 120,
		date: daysAgo(4).slice(0, 10),
		status: "completed",
		doctorId: null,
		source: "demo",
	},
];

const demoMessages = () => [
	{
		id: "demo-msg-1",
		role: "admin",
		subject: "Weekly operations summary",
		sender: "Clinic System",
		date: daysAgo(1),
		read: false,
		body: "Bookings are up this week. Three doctors have updated their availability — review the doctor list before the weekend.",
	},
	{
		id: "demo-msg-2",
		role: "admin",
		subject: "Patient feedback: smooth booking",
		sender: "Demo Patient",
		date: daysAgo(3),
		read: false,
		body: "A patient left a note saying the new online booking flow was quick and easy. Sharing with the team for visibility.",
	},
	{
		id: "demo-msg-3",
		role: "admin",
		subject: "Time-off request pending",
		sender: "Dr. Richard James",
		date: daysAgo(5),
		read: true,
		body: "Dr. Richard James requested time off next week. Open the Schedule page to review the request.",
	},
	{
		id: "demo-msg-4",
		role: "staff",
		subject: "Your shift schedule is published",
		sender: "Clinic Coordinator",
		date: daysAgo(1),
		read: false,
		body: "Next week's clinic roster is available. Let the admin team know if any slot conflicts with your plans.",
	},
	{
		id: "demo-msg-5",
		role: "staff",
		subject: "Reminder: update your availability",
		sender: "Clinic System",
		date: daysAgo(4),
		read: true,
		body: "Please keep your availability current so patients only see bookable slots.",
	},
];

const demoRequests = () => [
	{
		id: "demo-req-1",
		type: "time-off",
		requester: "Dr. Richard James",
		date: daysAhead(6),
		reason: "Annual leave — covering doctor arranged.",
		status: "pending",
		role: "staff",
		doctorId: "demo-staff",
		createdAt: daysAgo(2),
	},
	{
		id: "demo-req-2",
		type: "schedule-change",
		requester: "Dr. Richard James",
		date: daysAhead(9),
		reason: "Prefer afternoon clinics on this day.",
		status: "pending",
		role: "staff",
		doctorId: "demo-staff",
		createdAt: daysAgo(3),
	},
];

// ---- Orders ---------------------------------------------------------------

export const getLocalOrders = () => readList(ORDERS_KEY, demoOrders);

const appointmentToOrder = (item) => ({
	id: item._id,
	patient: item.userData?.name || "Patient",
	items: [{ name: `${item.doctorData?.name || "Doctor"} consultation`, qty: 1 }],
	total: item.amount || 0,
	date: `${item.slotDate || ""} · ${item.slotTime || ""}`.trim(),
	status: item.status || (item.cancelled ? "cancelled" : "pending"),
	doctorId: item.doctorId || null,
	source: "api",
	createdAt: new Date(item.date || Date.now()).toISOString(),
});

/** Real bookings first, then seeded demo orders; local status wins. */
export const buildOrders = (appointments = []) => {
	const local = getLocalOrders();
	const overrides = new Map(
		local.filter((o) => o.source === "api" || o.statusOverride).map((o) => [String(o.id), o])
	);
	const fromApi = appointments.map((item) => {
		const base = appointmentToOrder(item);
		const override = overrides.get(String(base.id));
		return override ? { ...base, status: override.status || base.status } : base;
	});
	const seen = new Set(fromApi.map((o) => String(o.id)));
	const demo = local.filter((o) => o.source !== "api" && !seen.has(String(o.id)));
	return [...fromApi, ...demo].filter(
		(order, index, all) => all.findIndex((o) => String(o.id) === String(order.id)) === index
	);
};

export const saveOrderStatus = (id, status) => {
	const local = getLocalOrders();
	const existing = local.find((o) => String(o.id) === String(id));
	const next = existing
		? local.map((o) => (String(o.id) === String(id) ? { ...o, status } : o))
		: [...local, { id, status, source: "api", statusOverride: true }];
	writeList(ORDERS_KEY, next);
};

// ---- Messages -------------------------------------------------------------

export const getLocalMessages = (role) =>
	readList(MESSAGES_KEY, demoMessages)
		.filter((m) => (m.role || "admin") === role)
		.sort((a, b) => new Date(b.date) - new Date(a.date));

export const saveLocalMessage = (message) => {
	const all = readList(MESSAGES_KEY, demoMessages);
	writeList(MESSAGES_KEY, [message, ...all]);
};

export const markLocalMessageRead = (id) => {
	const all = readList(MESSAGES_KEY, demoMessages);
	writeList(
		MESSAGES_KEY,
		all.map((m) => (String(m.id) === String(id) ? { ...m, read: true } : m))
	);
};

// ---- Schedule requests ----------------------------------------------------

export const getLocalRequests = (role) =>
	readList(SCHEDULE_KEY, demoRequests)
		.filter((r) => role === "admin" || (r.doctorId || "demo-staff") === "demo-staff")
		.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

export const saveLocalRequest = (request) => {
	const all = readList(SCHEDULE_KEY, demoRequests);
	writeList(SCHEDULE_KEY, [request, ...all]);
};

export const updateLocalRequestStatus = (id, status) => {
	const all = readList(SCHEDULE_KEY, demoRequests);
	writeList(
		SCHEDULE_KEY,
		all.map((r) => (String(r.id) === String(id) ? { ...r, status } : r))
	);
};

/** Merges API rows with local rows without losing offline-created items. */
export const mergeById = (apiRows = [], localRows = []) => {
	const ids = new Set(apiRows.map((row) => String(row.id || row._id)));
	return [
		...apiRows,
		...localRows.filter((row) => !ids.has(String(row.id || row._id))),
	];
};

export const formatDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value || "—";
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};
