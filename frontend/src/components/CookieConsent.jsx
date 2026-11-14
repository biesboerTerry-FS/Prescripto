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

// Renders a GDPR-style cookie consent banner with preference controls.
const CookieConsent = () => {
	const [visible, setVisible] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [preferences, setPreferences] = useState(false);

	useEffect(() => {
		const existing = getConsent();
		if (!hasConsentDecision()) {
			setVisible(true);
			setPreferences(existing?.preferences ?? false);
		} else {
			setPreferences(Boolean(existing?.preferences));
		}
		return onConsentOpen(() => {
			const current = getConsent();
			setPreferences(Boolean(current?.preferences));
			setShowDetails(true);
			setVisible(true);
		});
	}, []);

	const save = async (nextPreferences, decision) => {
		const consent = setConsent({
			preferences: nextPreferences,
			decision,
		});
		await syncConsentToServer(consent);
		setVisible(false);
		setShowDetails(false);
	};

	if (!visible) return null;

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
							session. With your permission, we also save preferences like your
							theme choice. No advertising trackers are used.{" "}
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
							onClick={() => save(false, "declined")}
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
							onClick={() => save(true, "accepted")}
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
								<input type="checkbox" checked disabled className="mt-1 h-4 w-4" aria-label="Essential cookies enabled" />
							</label>
							<label className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm font-medium text-slate-800 dark:text-slate-100">
										Preferences
									</p>
									<p className="text-xs text-slate-600 dark:text-slate-300">
										Remember settings like dark mode on this device.
									</p>
								</div>
								<input
									type="checkbox"
									checked={preferences}
									onChange={(e) => setPreferences(e.target.checked)}
									className="mt-1 h-4 w-4"
									aria-label="Allow preference cookies"
								/>
							</label>
						</div>
						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={() => save(preferences, "custom")}
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
