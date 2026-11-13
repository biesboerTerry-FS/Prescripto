import React from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		console.error("Application error:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="mx-auto flex max-w-3xl flex-col items-center py-24 px-4 text-center">
					<h1 className="text-2xl font-semibold text-slate-800">
						Something went wrong
					</h1>
					<p className="mt-2 text-sm text-slate-500">
						An unexpected error occurred. You can try again or return home.
					</p>
					<div className="mt-6 flex gap-3">
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
						>
							Reload page
						</button>
						<Link
							to="/"
							onClick={() => this.setState({ hasError: false })}
							className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
						>
							Back to Home
						</Link>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
