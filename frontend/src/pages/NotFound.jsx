import React from "react";
import { Link } from "react-router-dom";

// Renders the Not Found view.
const NotFound = () => {
	return (
		<div className="mx-auto flex max-w-3xl flex-col items-center py-24 px-4 text-center">
			<p className="text-7xl font-bold text-teal-700">404</p>
			<h1 className="mt-4 text-2xl font-semibold text-slate-800">
				This page could not be found
			</h1>
			<p className="mt-2 text-sm text-slate-500">
				The link may be broken, or the page may have moved.
			</p>
			<Link
				to="/"
				className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
			>
				Back to Home
			</Link>
		</div>
	);
};

export default NotFound;
