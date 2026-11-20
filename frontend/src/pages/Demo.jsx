import React from "react";
import { Link } from "react-router-dom";

const ADMIN_URL = "https://prescripto-admin-app.vercel.app";

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
				<h2 className="text-lg font-semibold text-slate-800">Admin &amp; doctor preview</h2>
				<p className="mt-2 text-sm text-slate-600">
					The admin panel is deployed separately. You can sign in as an admin or as a doctor from its login screen.
				</p>
				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					<div className="rounded-lg bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase text-slate-500">Admin</p>
						<p className="text-sm font-medium text-slate-800">demo-admin@prescripto.com</p>
						<p className="text-xs text-slate-500">DemoAdmin123!</p>
					</div>
					<div className="rounded-lg bg-slate-50 p-4">
						<p className="text-xs font-semibold uppercase text-slate-500">Doctor</p>
						<p className="text-sm font-medium text-slate-800">richard.james@prescripto.com</p>
						<p className="text-xs text-slate-500">Demo123456</p>
					</div>
				</div>
				<a
					href={ADMIN_URL}
					target="_blank"
					rel="noreferrer"
					className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
				>
					Open admin panel
				</a>
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
