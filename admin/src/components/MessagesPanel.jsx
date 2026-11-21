import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../lib/api";
import {
	formatDate,
	getLocalMessages,
	markLocalMessageRead,
	mergeById,
	saveLocalMessage,
	usePortalData,
} from "../lib/portalData";

const mapMessage = (message) => ({
	...message,
	id: message._id || message.id,
	date: message.createdAt || message.date,
});

/** Inbox + detail view for admin and staff. Backend first, localStorage fallback. */
const MessagesPanel = ({ role, senderName }) => {
	const version = usePortalData();
	const [messages, setMessages] = useState(() => getLocalMessages(role));
	const [selectedId, setSelectedId] = useState(null);
	const [composing, setComposing] = useState(false);
	const [form, setForm] = useState({
		toRole: role === "admin" ? "staff" : "admin",
		subject: "",
		body: "",
	});

	useEffect(() => {
		setMessages(getLocalMessages(role));
	}, [role, version]);

	// One best-effort API sync per role; failures keep the seeded local inbox.
	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const { data } = await api.get("/portal/messages");
				if (active && data?.success && Array.isArray(data.messages) && data.messages.length) {
					setMessages((local) => mergeById(data.messages.map(mapMessage), local));
				}
			} catch {
				// Offline demo — localStorage already has the seeded inbox.
			}
		})();
		return () => {
			active = false;
		};
	}, [role]);

	const selected = messages.find((m) => String(m.id) === String(selectedId)) || null;
	const unread = messages.filter((m) => !m.read).length;

	const openMessage = (message) => {
		setSelectedId(message.id);
		if (!message.read) {
			markLocalMessageRead(message.id);
			setMessages((current) =>
				current.map((m) => (String(m.id) === String(message.id) ? { ...m, read: true } : m))
			);
			// Only server-backed messages can be marked read on the API. Demo
			// rows live purely in localStorage; a fire-and-forget request with a
			// non-ObjectId would otherwise log a console error.
			const id = String(message.id);
			if (!id.startsWith("demo-") && !id.startsWith("local-")) {
				api.patch(`/portal/messages/${id}/read`, {}).catch(() => {});
			}
		}
	};

	const sendMessage = async (event) => {
		event.preventDefault();
		const subject = form.subject.trim();
		if (!subject) {
			toast.error("A subject is required.");
			return;
		}
		const message = {
			id: `local-msg-${Date.now()}`,
			role: form.toRole,
			subject,
			body: form.body.trim(),
			sender: senderName || (role === "admin" ? "Administrator" : "Staff member"),
			date: new Date().toISOString(),
			read: false,
		};
		saveLocalMessage(message);
		setComposing(false);
		setForm({ toRole: role === "admin" ? "staff" : "admin", subject: "", body: "" });
		toast.success("Message sent.");
		try {
			await api.post("/portal/messages", {
				toRole: form.toRole,
				subject,
				body: form.body.trim(),
				sender: message.sender,
			});
		} catch {
			// Local copy is the demo fallback.
		}
	};

	return (
		<section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold text-slate-800" data-testid="messages-heading">
						Messages
					</h2>
					<p className="mt-0.5 text-sm text-slate-500">
						{unread} unread · inbox for {role === "admin" ? "administrators" : "staff"}
					</p>
				</div>
				<button
					type="button"
					onClick={() => setComposing((v) => !v)}
					className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary"
				>
					{composing ? "Close" : "New message"}
				</button>
			</div>

			{composing && (
				<form onSubmit={sendMessage} className="grid gap-3 mt-4 p-4 border border-slate-200 rounded-lg">
					<label className="text-sm text-slate-600">
						To
						<select
							aria-label="Message recipient role"
							value={form.toRole}
							onChange={(e) => setForm((f) => ({ ...f, toRole: e.target.value }))}
							className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md"
						>
							<option value="admin">Administrators</option>
							<option value="staff">Staff</option>
						</select>
					</label>
					<label className="text-sm text-slate-600">
						Subject
						<input
							aria-label="Message subject"
							maxLength={200}
							required
							value={form.subject}
							onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
							className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md"
						/>
					</label>
					<label className="text-sm text-slate-600">
						Message
						<textarea
							aria-label="Message body"
							rows={3}
							maxLength={5000}
							value={form.body}
							onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
							className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md resize-y"
						/>
					</label>
					<button type="submit" className="w-fit px-4 py-2 text-sm text-white rounded-md bg-primary">
						Send message
					</button>
				</form>
			)}

			<div className="grid gap-5 mt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
				<ul data-testid="messages-inbox" className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
					{messages.map((message) => (
						<li key={message.id}>
							<button
								type="button"
								onClick={() => openMessage(message)}
								className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
									String(message.id) === String(selectedId) ? "bg-teal-50" : ""
								}`}
							>
								<div className="flex items-center justify-between gap-2">
									<span className="flex items-center gap-2 min-w-0">
										{!message.read && (
											<span className="w-2 h-2 rounded-full bg-primary" aria-label="Unread" />
										)}
										<span className={`truncate text-sm ${message.read ? "text-slate-700" : "font-semibold text-slate-800"}`}>
											{message.subject}
										</span>
									</span>
									<span className="shrink-0 text-xs text-slate-400">{formatDate(message.date)}</span>
								</div>
								<p className="mt-1 text-xs text-slate-500">From {message.sender}</p>
							</button>
						</li>
					))}
					{messages.length === 0 && (
						<li className="px-4 py-8 text-sm text-center text-slate-500">Your inbox is empty.</li>
					)}
				</ul>

				<div data-testid="message-detail" className="p-4 border border-slate-200 rounded-lg min-h-48">
					{selected ? (
						<>
							<h3 className="text-base font-semibold text-slate-800">{selected.subject}</h3>
							<p className="mt-1 text-xs text-slate-500">
								From {selected.sender} · {formatDate(selected.date)}
							</p>
							<p className="mt-4 text-sm whitespace-pre-wrap text-slate-600">
								{selected.body || "(no message body)"}
							</p>
						</>
					) : (
						<p className="text-sm text-slate-500">Select a message to read it.</p>
					)}
				</div>
			</div>
		</section>
	);
};

export default MessagesPanel;
