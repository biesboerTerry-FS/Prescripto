import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { getConsent, hasConsentDecision, onConsentOpen, setConsent } from "../lib/consent";

const syncConsentToServer = async (consent) => {
	const token = localStorage.getItem("token");
	if (!token) return;
	try {
		await api.post(
			"/user/cookie-consent",
			{
				preferences: Boolean(consent.preferences),
				analytics: Boolean(consent.analytics),
				marketing: Boolean(consent.marketing),
				decision: consent.decision,
				timestamp: consent.timestamp,
				version: consent.version,
			},
			{ skipAuthRedirect: true }
		);
	} catch {
		// best-effort: client-side consent still applies
	}
};

// Renders a GDPR-style cookie consent banner with granular preference controls.
const CookieConsent = () => {
	const [visible, setVisible] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [analytics, setAnalytics] = useState(false);
	const [marketing, setMarketing] = useState(false);

	useEffect(() => {
		const existing = getConsent();
		if (!hasConsentDecision()) {
			setVisible(true);
			setAnalytics(Boolean(existing?.analytics));
			setMarketing(Boolean(existing?.marketing));
		} else {
			setAnalytics(Boolean(existing?.analytics));
			setMarketing(Boolean(existing?.marketing));
		}
		return onConsentOpen(() => {
			const current = getConsent();
			setAnalytics(Boolean(current?.analytics));
			setMarketing(Boolean(current?.marketing));
			setShowDetails(true);
			setVisible(true);
		});
	}, []);

	const save = async (nextAnalytics, nextMarketing, decision) => {
		const consent = setConsent({
			analytics: nextAnalytics,
			marketing: nextMarketing,
			decision,
		});
		await syncConsentToServer(consent);
		setVisible(false);
		setShowDetails(false);
	};

	if (!visible) return null;

	const checkbox = "mt-1 h-4 w-4";

	return (
		<div
			role="dialog"
			aria-live="polite"
			aria-label="Cookie consent"
			className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
		>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="text-sm text-slate-600 dark:text-slate-300">
						<p className="font-medium text-slate-800 dark:text-slate-100">
							Cookie &amp; storage preferences
						</p>
						<p className="mt-1">
							We use essential storage to keep you signed in and secure your
							session. You can also choose optional analytics and marketing
							storage. Change this any time from the footer.{" "}
							<Link
								to="/privacy"
								className="underline hover:text-primary"
								onClick={() => setVisible(false)}
							>
								Privacy Policy
							</Link>
							.
						</p>
					</div>
					<div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
						<button
							type="button"
							onClick={() => save(false, false, "declined")}
							className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
						>
							Reject non-essential
						</button>
						<button
							type="button"
							onClick={() => setShowDetails((v) => !v)}
							className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
							aria-expanded={showDetails}
						>
							{showDetails ? "Hide options" : "Manage"}
						</button>
						<button
							type="button"
							onClick={() => save(true, true, "accepted")}
							className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
						>
							Accept all
						</button>
					</div>
				</div>

				{showDetails && (
					<div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
						<div className="flex flex-col gap-3">
							<label className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm font-medium text-slate-800 dark:text-slate-100">
										Essential
									</p>
									<p className="text-xs text-slate-600 dark:text-slate-300">
										Required for sign-in, security, and core booking features.
										Always active.
									</p>
								</div>
								<input type="checkbox" checked disabled className={checkbox} aria-label="Essential cookies enabled" />
							</label>
							<label className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm font-medium text-slate-800 dark:text-slate-100">
										Analytics
									</p>
									<p className="text-xs text-slate-600 dark:text-slate-300">
										Help us understand which pages and specialties are useful.
									</p>
								</div>
								<input
									type="checkbox"
									checked={analytics}
									onChange={(e) => setAnalytics(e.target.checked)}
									className={checkbox}
									aria-label="Allow analytics cookies"
								/>
							</label>
							<label className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm font-medium text-slate-800 dark:text-slate-100">
										Marketing
									</p>
									<p className="text-xs text-slate-600 dark:text-slate-300">
										Remember preferences for health tips and offers. No
										third-party ad trackers are used.
									</p>
								</div>
								<input
									type="checkbox"
									checked={marketing}
									onChange={(e) => setMarketing(e.target.checked)}
									className={checkbox}
									aria-label="Allow marketing cookies"
								/>
							</label>
						</div>
						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={() => save(analytics, marketing, "custom")}
								className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
							>
								Save preferences
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CookieConsent;
