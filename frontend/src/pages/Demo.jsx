import React from "react";
import { Link } from "react-router-dom";

const stack = [
	{ name: "React", role: "Frontend UI" },
	{ name: "Vite", role: "Build tooling" },
	{ name: "Tailwind CSS", role: "Styling" },
	{ name: "React Router", role: "Routing" },
	{ name: "Node.js", role: "Runtime" },
	{ name: "Express", role: "API framework" },
	{ name: "MongoDB", role: "Database" },
	{ name: "JWT", role: "Auth tokens" },
	{ name: "Clerk-ready", role: "Patient auth bridge" },
	{ name: "Expo", role: "Mobile apps" },
];

// Renders the Demo / Portfolio info page.
const Demo = () => {
	return (
		<div className="mx-auto max-w-3xl py-10">
			<h1 className="text-center text-2xl font-semibold text-slate-700">
				DEMO <span className="text-slate-900">PORTFOLIO</span>
			</h1>

			<div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-slate-800">Try it instantly</h2>
				<p className="mt-2 text-sm text-slate-600">
					Use the demo patient account to book appointments, view your profile, and test the patient experience.
				</p>
				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					<div className="rounded-lg bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase text-slate-500">Email</p>
						<p className="text-sm font-medium text-slate-800">demo@prescripto.com</p>
					</div>
					<div className="rounded-lg bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase text-slate-500">Password</p>
						<p className="text-sm font-medium text-slate-800">Demo123456</p>
					</div>
				</div>
				<Link
					to="/login"
					className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
				>
					Go to login
				</Link>
			</div>

			<div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-slate-800">Admin preview</h2>
				<p className="mt-2 text-sm text-slate-600">
					The admin panel is deployed separately. Use the admin credentials you configured in the backend environment (default in local seed is in <code>backend/.env</code>).
				</p>
			</div>

			<div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-slate-800">Built with</h2>
				<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
					{stack.map((item) => (
						<div key={item.name} className="rounded-lg bg-slate-50 p-3">
							<p className="text-sm font-semibold text-slate-800">{item.name}</p>
							<p className="text-xs text-slate-500">{item.role}</p>
						</div>
					))}
				</div>
			</div>

			<div className="mt-8 text-center">
				<a
					href="https://github.com/biesboerTerry-FS/Prescripto"
					target="_blank"
					rel="noreferrer"
					className="text-sm font-medium text-primary hover:underline"
				>
					View source on GitHub →
				</a>
			</div>
		</div>
	);
};

export default Demo;
