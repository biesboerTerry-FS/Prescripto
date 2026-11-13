import React from "react";
import { Link } from "react-router-dom";
import { specialtyData } from "../assets/assets";

// Renders the Sitemap view with quick links to key pages and specialty listings.
const Sitemap = () => {
	const pages = [
		{ to: "/", label: "Home" },
		{ to: "/doctors", label: "Find doctors" },
		{ to: "/about", label: "About us" },
		{ to: "/contact", label: "Contact" },
		{ to: "/faqs", label: "FAQs" },
		{ to: "/login", label: "Sign in / Create account" },
		{ to: "/my-appointments", label: "My appointments" },
		{ to: "/my-profile", label: "My profile" },
		{ to: "/privacy", label: "Privacy policy" },
		{ to: "/terms", label: "Terms of service" },
	];

	return (
		<div className="mx-auto max-w-4xl py-10">
			<h1 className="text-3xl font-semibold text-slate-800">Sitemap</h1>
			<p className="mt-2 text-sm text-slate-500">
				A quick overview of the main pages on Prescripto.
			</p>

			<section className="mt-8">
				<h2 className="text-lg font-semibold text-slate-800">Pages</h2>
				<ul className="mt-3 grid gap-2 text-sm text-teal-700 sm:grid-cols-2">
					{pages.map((page) => (
						<li key={page.to}>
							<Link className="hover:underline" to={page.to}>
								{page.label}
							</Link>
						</li>
					))}
				</ul>
			</section>

			<section className="mt-8">
				<h2 className="text-lg font-semibold text-slate-800">
					Doctors by specialty
				</h2>
				<ul className="mt-3 grid gap-2 text-sm text-teal-700 sm:grid-cols-2">
					{specialtyData.map((item) => (
						<li key={item.specialty}>
							<Link
								className="hover:underline"
								to={`/doctors/${item.specialty}`}
							>
								{item.specialty}
							</Link>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
};

export default Sitemap;
