import React from "react";

// Renders the Privacy view.
const Privacy = () => {
	return (
		<div className="mx-auto max-w-3xl py-12 px-4">
			<h1 className="text-3xl font-semibold text-slate-800">
				Privacy Policy
			</h1>
			<p className="mt-2 text-sm text-slate-500">
				Last updated: November 2026. This page explains what data
				Prescripto stores and why — in plain language.
			</p>

			<div className="mt-8 flex flex-col gap-7 text-sm leading-6 text-slate-600">
				<section>
					<h2 className="text-base font-semibold text-slate-800">
						What we collect
					</h2>
					<p className="mt-2">
						When you create an account we store your name, email,
						and a securely hashed password (never the raw
						password). If you use Google sign-in we store your
						Google profile name, email, and avatar instead of a
						password. Booking an appointment stores the doctor,
						time slot, and amount so we can manage your visit.
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						What we never share
					</h2>
					<p className="mt-2">
						We do not sell or rent your personal data. Details of
						an appointment are only shared with the doctor you are
						visiting and with service providers that power the app
						(database hosting, image storage, and — when enabled —
						payment processing).
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Cookies and local storage
					</h2>
					<p className="mt-2">
						We keep your sign-in token and dark-mode preference in
						your browser’s local storage so you stay signed in and
						your settings persist. You can accept or decline
						non-essential cookies through the banner shown on your
						first visit. No advertising trackers run on this site.
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Your choices
					</h2>
					<p className="mt-2">
						You can update your profile information any time under
						My Profile, cancel upcoming appointments to free your
						slot, and contact us to request a copy or deletion of
						your data.
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Contact
					</h2>
					<p className="mt-2">
						Questions about this policy? Email
						thatdevterry@gmail.com or call +1 314-723-1421.
					</p>
				</section>
			</div>
		</div>
	);
};

export default Privacy;
