import React from "react";
import { Link } from "react-router-dom";
import {
	buildOrders,
	formatDate,
	usePortalData,
} from "../lib/portalData";

/**
 * Compact dashboard widget with the most recent pending orders. Used on both
 * the admin dashboard and the staff portal home view.
 */
const PendingOrders = ({ appointments = [], to = "/orders", title = "Pending orders" }) => {
	usePortalData();
	const pending = buildOrders(appointments)
		.filter((order) => order.status === "pending")
		.slice(0, 4);

	return (
		<section
			data-testid="pending-orders"
			className="p-4 mt-6 bg-white border border-slate-200 rounded-xl shadow-sm"
		>
			<div className="flex items-center justify-between gap-3">
				<div>
					<h2 className="text-sm font-semibold text-slate-800" data-testid="pending-orders-title">
						{title}
					</h2>
					<p className="mt-0.5 text-xs text-slate-500">
						Most recent orders waiting to be fulfilled.
					</p>
				</div>
				<Link to={to} className="text-xs font-medium text-teal-700 hover:underline">
					View all →
				</Link>
			</div>
			{pending.length === 0 ? (
				<p className="py-5 mt-3 text-sm text-center text-slate-500">
					No pending orders. You're all caught up.
				</p>
			) : (
				<ul className="mt-3 divide-y divide-slate-100">
					{pending.map((order) => (
						<li
							key={order.id}
							className="flex items-center justify-between gap-3 py-2.5 text-sm"
						>
							<div className="min-w-0">
								<p className="font-medium truncate text-slate-800">{order.patient}</p>
								<p className="text-xs truncate text-slate-500">
									{order.items?.map((i) => i.name).join(", ")} · {formatDate(order.date)}
								</p>
							</div>
							<span className="shrink-0 text-sm font-medium text-slate-700">
								${Number(order.total || 0).toFixed(0)}
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

export default PendingOrders;
