import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		console.error("Admin panel error:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
					<h1 className="text-xl font-semibold text-slate-800">
						Something went wrong
					</h1>
					<p className="mt-2 text-sm text-slate-500">
						An unexpected error occurred in this view.
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
					>
						Reload panel
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
