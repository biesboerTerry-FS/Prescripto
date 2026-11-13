import React from "react";
import { Link } from "react-router-dom";

// Renders the Not Found view.
const NotFound = () => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
			<p className="text-5xl font-bold text-teal-700">404</p>
			<h1 className="mt-3 text-xl font-semibold text-slate-800">
				Page not found
			</h1>
			<p className="mt-2 text-sm text-slate-500">
				The admin page you requested does not exist.
			</p>
			<Link
				to="/admin-dashboard"
				className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
			>
				Go to Dashboard
			</Link>
		</div>
	);
};

export default NotFound;
