import React from "react";

// Horizontal bars, sized relative to the largest value. No chart library needed.
const BarList = ({ title, items, emptyText = "No data yet." }) => {
	const max = Math.max(1, ...items.map((i) => i.count));
	return (
		<div className="p-5 bg-white border rounded-xl border-slate-200 shadow-sm">
			<p className="font-medium text-slate-800">{title}</p>
			{items.length === 0 && <p className="mt-4 text-sm text-slate-500">{emptyText}</p>}
			<ul className="mt-4 flex flex-col gap-3">
				{items.map((item) => (
					<li key={item.label}>
						<div className="flex justify-between mb-1 text-sm">
							<span className="text-slate-600">{item.label}</span>
							<span className="font-medium text-slate-800">{item.count}</span>
						</div>
						<div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
							<div
								className="h-full rounded-full bg-primary transition-all duration-500"
								style={{ width: `${(item.count / max) * 100}%` }}
							/>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default BarList;
