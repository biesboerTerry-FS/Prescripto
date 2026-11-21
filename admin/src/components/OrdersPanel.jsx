import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../lib/api";
import {
	buildOrders,
	ORDER_STATUSES,
	STATUS_LABELS,
	saveOrderStatus,
	usePortalData,
} from "../lib/portalData";

const STATUS_STYLES = {
	pending: "bg-amber-50 text-amber-700",
	confirmed: "bg-blue-50 text-blue-700",
	in_progress: "bg-violet-50 text-violet-700",
	completed: "bg-teal-50 text-teal-700",
	cancelled: "bg-red-50 text-red-700",
};

/** Orders table with a status control on every row. Shared by both portals. */
const OrdersPanel = ({ role, appointments = [] }) => {
	usePortalData();
	const [filter, setFilter] = useState("all");

	const orders = buildOrders(appointments);
	const visible =
		filter === "all" ? orders : orders.filter((order) => order.status === filter);
	const pendingCount = orders.filter((o) => o.status === "pending").length;

	const changeStatus = async (order, status) => {
		saveOrderStatus(order.id, status);
		if (order.source === "api") {
			try {
				// Best effort: localStorage above is the offline fallback.
				await api.patch(`/appointment/${order.id}/status`, { status });
			} catch {
				// Keep the local change; the demo works without the API.
			}
		}
		toast.success(`Order ${order.id} → ${STATUS_LABELS[status]}`);
	};

	return (
		<section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold text-slate-800" data-testid="orders-heading">
						Orders
					</h2>
					<p className="mt-0.5 text-sm text-slate-500">
						{orders.length} total · {pendingCount} pending · {role === "admin" ? "all patients" : "your bookings"}
					</p>
				</div>
				<label className="flex items-center gap-2 text-sm text-slate-600">
					Filter
					<select
						aria-label="Filter orders by status"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="px-2 py-1.5 border border-slate-300 rounded-md text-sm"
					>
						<option value="all">All statuses</option>
						{ORDER_STATUSES.map((status) => (
							<option key={status} value={status}>
								{STATUS_LABELS[status]}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="overflow-x-auto mt-5">
				<table className="w-full text-sm" data-testid="orders-table">
					<thead>
						<tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
							<th className="py-2 pr-4">Order</th>
							<th className="py-2 pr-4">Patient</th>
							<th className="py-2 pr-4">Items</th>
							<th className="py-2 pr-4">Total</th>
							<th className="py-2 pr-4">Date</th>
							<th className="py-2">Status</th>
						</tr>
					</thead>
					<tbody>
						{visible.map((order) => (
							<tr key={order.id} className="border-b border-slate-100 last:border-b-0">
								<td className="py-3 pr-4 font-medium text-slate-700">#{String(order.id).slice(-6)}</td>
								<td className="py-3 pr-4 text-slate-800">{order.patient}</td>
								<td className="py-3 pr-4 text-slate-600">
									{order.items?.map((item) => `${item.name} ×${item.qty}`).join(", ") || "—"}
								</td>
								<td className="py-3 pr-4 text-slate-800">${Number(order.total || 0).toFixed(0)}</td>
								<td className="py-3 pr-4 text-slate-600">{order.date}</td>
								<td className="py-3">
									<select
										aria-label={`Status for order ${order.id}`}
										data-testid={`order-status-${order.id}`}
										value={order.status}
										onChange={(e) => changeStatus(order, e.target.value)}
										className={`px-2 py-1.5 rounded-full text-xs font-medium border-0 ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}
									>
										{ORDER_STATUSES.map((status) => (
											<option key={status} value={status}>
												{STATUS_LABELS[status]}
											</option>
										))}
									</select>
								</td>
							</tr>
						))}
						{visible.length === 0 && (
							<tr>
								<td colSpan={6} className="py-8 text-center text-slate-500">
									No orders match this filter.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default OrdersPanel;
