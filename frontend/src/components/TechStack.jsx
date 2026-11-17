import React from "react";

const tech = [
	"React",
	"Vite",
	"Tailwind CSS",
	"React Router",
	"Node.js",
	"Express",
	"MongoDB",
	"JWT",
	"Expo",
	"Clerk-ready",
];

// Renders the Tech Stack section.
const TechStack = () => {
	return (
		<section className="py-10 text-center">
			<p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Built with</p>
			<div className="mt-4 flex flex-wrap justify-center gap-3">
				{tech.map((name) => (
					<span
						key={name}
						className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
					>
						{name}
					</span>
				))}
			</div>
		</section>
	);
};

export default TechStack;
