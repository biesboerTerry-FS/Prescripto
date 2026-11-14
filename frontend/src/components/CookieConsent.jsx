import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "prescripto_cookie_consent";

// Renders a GDPR-style cookie consent banner.
const CookieConsent = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		try {
			const consent = localStorage.getItem(STORAGE_KEY);
			if (consent === null) setVisible(true);
		} catch {
			// localStorage may be disabled in private browsing.
		}
	}, []);

	const setConsent = (value) => {
		try {
			localStorage.setItem(STORAGE_KEY, value);
		} catch {
			// ignore storage errors.
		}
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div
			role="dialog"
			aria-live="polite"
			aria-label="Cookie consent"
			className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-700"
		>
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
				<p className="text-sm text-slate-600 dark:text-slate-300">
					We use local storage and cookies to keep you signed in and remember your
					dark-mode preference. No advertising trackers are used.{" "}
					<Link
						to="/privacy"
						className="underline hover:text-primary"
						onClick={() => setVisible(false)}
					>
						Learn more
					</Link>
					.
				</p>
				<div className="flex shrink-0 gap-3">
					<button
						type="button"
						onClick={() => setConsent("declined")}
						className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
					>
						Decline
					</button>
					<button
						type="button"
						onClick={() => setConsent("accepted")}
						className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
					>
						Accept
					</button>
				</div>
			</div>
		</div>
	);
};

export default CookieConsent;
