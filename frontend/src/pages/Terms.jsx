import React from "react";

// Renders the Terms view.
const Terms = () => {
	return (
		<div className="mx-auto max-w-3xl py-12 px-4">
			<h1 className="text-3xl font-semibold text-slate-800">
				Terms of Service
			</h1>
			<p className="mt-2 text-sm text-slate-500">
				By using Prescripto you agree to these terms. Keep it simple:
				be kind, book what you need, cancel when you cannot make it.
			</p>

			<div className="mt-8 flex flex-col gap-7 text-sm leading-6 text-slate-600">
				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Bookings
					</h2>
					<p className="mt-2">
						Each booking reserves one time slot with the named
						doctor. Slots are first-come, first-served — once
						booked, a slot is unavailable to other patients. If
						you can no longer attend, cancel from My Appointments
						so the slot can be offered to someone else.
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Payments
					</h2>
					<p className="mt-2">
						Appointment fees are shown before you book, in USD.
						When online payment is enabled, charges are processed
						by Stripe; Prescripto never sees or stores full card
						numbers. Cancelled appointments are not charged.
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Accounts
					</h2>
					<p className="mt-2">
						You are responsible for activity under your account.
						Please use a strong, unique password and sign out on
						shared devices. We may suspend accounts that misuse
						the service (e.g. bulk booking to block slots).
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Availability and liability
					</h2>
					<p className="mt-2">
						Doctor schedules can change. A doctor may mark
						themselves unavailable, which cancels affected
						bookings. Prescripto is a booking tool — medical
						advice and treatment are provided by your doctor, and
						we are not liable for clinical decisions.
					</p>
				</section>

				<section>
					<h2 className="text-base font-semibold text-slate-800">
						Changes
					</h2>
					<p className="mt-2">
						We may update these terms as the product grows.
						Material changes will be noted here with a new
						last-updated date. Continued use means you accept
						the current terms.
					</p>
				</section>
			</div>
		</div>
	);
};

export default Terms;
