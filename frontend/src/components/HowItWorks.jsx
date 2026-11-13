import React from "react";
import { Link } from "react-router-dom";

const steps = [
	{
		n: "1",
		title: "Choose a specialty",
		text: "Browse trusted doctors by what you need, from general check-ups to specialist care.",
	},
	{
		n: "2",
		title: "Pick a free slot",
		text: "See real availability for the next week and choose the time that suits you.",
	},
	{
		n: "3",
		title: "Confirm and go",
		text: "Get an instant confirmation, manage it in My Appointments, and cancel anytime.",
	},
];

// Renders the How It Works UI.
const HowItWorks = () => {
	return (
		<section className="my-16">
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-3xl font-medium text-gray-900">How it works</h1>
				<p className="text-sm text-slate-500">Three steps from search to appointment.</p>
			</div>
			<ol className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-3">
				{steps.map((step) => (
					<li key={step.n} className="relative p-6 bg-white border shadow-sm rounded-xl border-slate-200">
						<span className="flex items-center justify-center w-10 h-10 mb-4 text-base font-semibold text-white rounded-full bg-primary">
							{step.n}
						</span>
						<p className="text-base font-semibold text-slate-800">{step.title}</p>
						<p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
					</li>
				))}
			</ol>
			<div className="flex justify-center mt-10">
				<Link
					to="/doctors"
					className="px-10 py-3 text-sm font-medium text-white rounded-full bg-primary transition-colors hover:bg-primary-dark"
				>
					Find a doctor
				</Link>
			</div>
		</section>
	);
};

export default HowItWorks;
