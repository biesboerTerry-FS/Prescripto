import React from "react";
import Header from "../components/Header";
import SpecialtyMenu from "../components/SpecialtyMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import Testimonials from "../components/Testimonials";
import HowItWorks from "../components/HowItWorks";
import TechStack from "../components/TechStack";

const perks = [
	{
		icon: "✓",
		title: "Verified doctors",
		text: "Every doctor on Prescripto is credential-checked before listing.",
	},
	{
		icon: "◷",
		title: "Book in under a minute",
		text: "Real-time slots, instant confirmation, and free cancellation.",
	},
	{
		icon: "🔒",
		title: "Private by default",
		text: "Your details go only to the doctor you visit. No data selling.",
	},
];

// Renders the Home view.
const Home = () => {
	return (
		<div>
			<Header />
			<div className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-3">
				{perks.map((perk) => (
					<div
						key={perk.title}
						className="flex gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
					>
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg text-teal-700 ring-1 ring-teal-100">
							{perk.icon}
						</span>
						<div>
							<p className="text-sm font-semibold text-slate-800">
								{perk.title}
							</p>
							<p className="mt-1 text-xs leading-5 text-slate-500">
								{perk.text}
							</p>
						</div>
					</div>
				))}
			</div>
			<SpecialtyMenu />
			<TopDoctors />
			<HowItWorks />
			<Testimonials />
			<Banner />
			<TechStack />
		</div>
	);
};

export default Home;
