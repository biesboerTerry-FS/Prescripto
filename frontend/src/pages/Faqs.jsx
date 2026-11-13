import React, { useState } from "react";

const faqs = [
	{
		q: "How do I book an appointment?",
		a: "Browse doctors by specialty, open a doctor's profile, pick an available day and time slot, and press \"Schedule Appointment\". You will need a free account first — sign up takes under a minute.",
	},
	{
		q: "Do I need to pay online?",
		a: "No. You can book and pay at the clinic, or use \"Pay online now\" from My Appointments when online payments are enabled. The fee is always shown before you confirm.",
	},
	{
		q: "How do I cancel or reschedule?",
		a: "Go to My Appointments and press \"Cancel appointment\". The slot is released instantly so another patient can book it. To change times, cancel the old booking and book a new one.",
	},
	{
		q: "Can I sign in with Google?",
		a: "Yes — if Google sign-in is enabled, you will see a \"Continue with Google\" button on the login page. Your Google details create an account automatically the first time.",
	},
	{
		q: "Is my health information private?",
		a: "Only the doctor you book with sees your appointment details. Passwords are stored hashed, and we never sell personal data. See the Privacy Policy for the full picture.",
	},
	{
		q: "The doctors list looks empty — what happened?",
		a: "The app connects to a live database. If it is unreachable (for example a paused demo database), the lists render empty while the rest of the site keeps working. Check the backend health endpoint (/health) to confirm.",
	},
];

// Renders the Faqs view.
const Faqs = () => {
	const [open, setOpen] = useState(0);

	return (
		<div className="mx-auto max-w-3xl py-12 px-4">
			<h1 className="text-3xl font-semibold text-slate-800">
				Frequently Asked Questions
			</h1>
			<p className="mt-2 text-sm text-slate-500">
				Quick answers to the things patients ask most. Still stuck?
				See the Contact page.
			</p>

			<div className="mt-8 flex flex-col gap-3">
				{faqs.map((item, index) => (
					<div
						key={index}
						className="rounded-xl border border-slate-200 bg-white shadow-sm"
					>
						<button
							onClick={() => setOpen(open === index ? -1 : index)}
							className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-800"
							aria-expanded={open === index}
						>
							{item.q}
							<span
								className={`inline-block shrink-0 text-teal-600 transition-transform duration-300 ${
									open === index ? "rotate-45" : ""
								}`}
							>
								+
							</span>
						</button>
						{open === index && (
							<p className="px-5 pb-4 text-sm leading-6 text-slate-600">
								{item.a}
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Faqs;
