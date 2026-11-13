import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets, specialtyData } from "../assets/assets";
import { toast } from "react-toastify";

// Renders the Footer UI.
const Footer = () => {
	const [email, setEmail] = useState("");
	const [showSpecialties, setShowSpecialties] = useState(false);
	const year = new Date().getFullYear();

	// Helper that subscribe.
	const subscribe = (event) => {
		event.preventDefault();
		if (!email || !email.includes("@")) {
			return toast.error("Please enter a valid email address");
		}
		setEmail("");
		toast.success("Thanks for subscribing to health tips!");
	};

	return (
		<footer className="mt-12 w-full bg-teal-950 px-4 pt-8 pb-4 text-teal-50 sm:px-6 lg:px-12">
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
				<div>
					<img
						className="w-40 brightness-0 invert"
						src={assets.logo}
						alt="Prescripto"
					/>
					<p className="mt-3 max-w-xs text-sm leading-6 text-teal-100/80">
						Trusted doctors, simple booking. Browse specialties,
						pick a time that suits you, and get care without the
						phone queues.
					</p>
					<div className="mt-4 flex gap-3">
						{["X", "Instagram", "LinkedIn"].map((name) => (
							<a
								key={name}
								href="#"
								onClick={(e) => e.preventDefault()}
								aria-label={`${name} (coming soon)`}
								className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white transition-colors hover:bg-teal-600"
							>
								{name[0]}
							</a>
						))}
					</div>
				</div>

				<div>
					<p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
						Company
					</p>
					<ul className="flex flex-col gap-2 text-sm text-teal-100/80">
						<li>
							<Link className="hover:text-white" to="/">
								Home
							</Link>
						</li>
						<li className="relative">
							<div className="flex items-center gap-2">
								<Link
									className="hover:text-white"
									to="/doctors"
									onClick={() => window.scrollTo(0, 0)}
								>
									Find Doctors
								</Link>
								<button
									type="button"
									onClick={() => setShowSpecialties((open) => !open)}
									aria-expanded={showSpecialties}
									aria-label="Show specialties"
									className="flex h-5 w-5 items-center justify-center rounded text-teal-200 transition-colors hover:bg-white/10 hover:text-white"
								>
									<span
										className={`inline-block text-xs transition-transform duration-200 ${
											showSpecialties ? "rotate-180" : ""
										}`}
									>
										▾
									</span>
								</button>
							</div>
							{showSpecialties && (
								<div className="absolute bottom-full left-0 z-20 mb-2 w-56 rounded-xl bg-teal-900 p-3 shadow-2xl ring-1 ring-white/10">
									<div className="mb-2 flex items-center justify-between">
										<p className="text-xs font-semibold uppercase tracking-wider text-white">
											Specialties
										</p>
										<button
											type="button"
											onClick={() => setShowSpecialties(false)}
											aria-label="Close specialties"
											className="flex h-6 w-6 items-center justify-center rounded-full text-teal-200 transition-colors hover:bg-white/10 hover:text-white"
										>
											✕
										</button>
									</div>
									<ul className="flex flex-col gap-1 text-sm text-teal-100/80">
										{specialtyData.map((item) => (
											<li key={item.specialty}>
												<Link
													className="block rounded-md px-2 py-1.5 hover:bg-white/10 hover:text-white"
													onClick={() => {
														setShowSpecialties(false);
														window.scrollTo(0, 0);
													}}
													to={`/doctors/${item.specialty}`}
												>
													{item.specialty}
												</Link>
											</li>
										))}
									</ul>
								</div>
							)}
						</li>
						<li>
							<Link className="hover:text-white" to="/about">
								About Us
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/contact">
								Contact
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/faqs">
								FAQs
							</Link>
						</li>
					</ul>
				</div>

				<div>
					<p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
						Health tips, monthly
					</p>
					<p className="text-sm text-teal-100/80">
						One friendly email a month. No spam, unsubscribe any time.
					</p>
					<form onSubmit={subscribe} className="mt-3 flex gap-2">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@email.com"
							className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-teal-200/60 focus:border-teal-300 focus:outline-none"
						/>
						<button
							type="submit"
							className="shrink-0 rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
						>
							Join
						</button>
					</form>
					<p className="mt-4 text-sm text-teal-100/80">
						+1 314-723-1421 · thatdevterry@gmail.com
					</p>
				</div>
			</div>

			<div className="mt-6 border-t border-white/10 pt-4">
				<div className="flex flex-col items-center justify-between gap-2 text-xs text-teal-100/70 sm:flex-row">
					<p>© {year} Prescripto. All rights reserved.</p>
					<ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
						<li>
							<Link className="hover:text-white" to="/privacy">
								Privacy Policy
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/terms">
								Terms of Service
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/faqs">
								FAQs
							</Link>
						</li>
						<li>
							<Link className="hover:text-white" to="/sitemap">
								Sitemap
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
