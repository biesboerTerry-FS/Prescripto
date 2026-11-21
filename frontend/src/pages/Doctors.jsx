import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { specialtyData } from "../assets/assets";

const SPECIALTIES = specialtyData.map((item) => item.specialty);

// Collects every searchable field from a doctor record into one lowercase string.
const searchableText = (doctor) =>
	[
		doctor.name,
		doctor.specialty,
		doctor.degree,
		doctor.experience,
		doctor.about,
		doctor.email,
		doctor.address?.line1,
		doctor.address?.line2,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();

const priceOf = (doctor) => Number(doctor.offerPrice ?? doctor.fees ?? 0);

// Renders the Doctors view with a single, consolidated filter panel.
const Doctors = () => {
	const navigate = useNavigate();
	const { specialty } = useParams();
	const { doctors } = useContext(AppContext);

	const [query, setQuery] = useState("");
	const [specialtyFilter, setSpecialtyFilter] = useState(specialty || "");
	const [sort, setSort] = useState("featured");
	const [availableOnly, setAvailableOnly] = useState(false);
	const [newPatientsOnly, setNewPatientsOnly] = useState(false);

	// Keep the dropdown in sync with links from the home page (/doctors/:specialty).
	useEffect(() => {
		setSpecialtyFilter(specialty || "");
	}, [specialty]);

	const visibleDoctors = useMemo(() => {
		const term = query.trim().toLowerCase();
		const list = doctors.filter((doctor) => {
			if (specialtyFilter && doctor.specialty !== specialtyFilter) return false;
			if (term && !searchableText(doctor).includes(term)) return false;
			if (availableOnly && !doctor.available) return false;
			// The doctor model has no explicit "accepting new patients" flag;
			// active staff status is the closest supported signal.
			if (newPatientsOnly && doctor.hrStatus === "inactive") return false;
			return true;
		});
		if (sort === "price-asc") return [...list].sort((a, b) => priceOf(a) - priceOf(b));
		if (sort === "price-desc") return [...list].sort((a, b) => priceOf(b) - priceOf(a));
		return list;
	}, [doctors, query, specialtyFilter, sort, availableOnly, newPatientsOnly]);

	const clearFilters = () => {
		setQuery("");
		setSort("featured");
		setAvailableOnly(false);
		setNewPatientsOnly(false);
		setSpecialtyFilter("");
		navigate("/doctors");
	};

	const changeSpecialty = (value) => {
		setSpecialtyFilter(value);
		navigate(value ? `/doctors/${encodeURIComponent(value)}` : "/doctors");
	};

	return (
		<div className="pt-6 sm:pt-8">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
						Our specialists
					</p>
					<h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
						Browse by Specialty
					</h1>
				</div>
				<p className="text-sm text-gray-500 dark:text-slate-400" aria-live="polite">
					Showing <span className="font-semibold text-gray-800 dark:text-slate-100">{visibleDoctors.length}</span>{" "}
					of {doctors.length} doctors
				</p>
			</div>

			{/* Filter panel */}
			<section
				aria-label="Doctor filters"
				className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-16px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-800/80 sm:p-5"
			>
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
					<label className="flex flex-col gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-300">
						Search doctors
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Name, specialty, degree, experience…"
							aria-label="Search doctors"
							className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-teal-900/40"
						/>
					</label>
					<label className="flex flex-col gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-300">
						Specialty
						<select
							value={specialtyFilter}
							onChange={(e) => changeSpecialty(e.target.value)}
							aria-label="Filter by specialty"
							className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
						>
							<option value="">All specialties</option>
							{SPECIALTIES.map((item) => (
								<option key={item} value={item}>
									{item}
								</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-300">
						Sort by price
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value)}
							aria-label="Sort by price"
							className="w-full rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
						>
							<option value="featured">Featured</option>
							<option value="price-asc">Price: low to high</option>
							<option value="price-desc">Price: high to low</option>
						</select>
					</label>
					<div className="flex flex-col justify-end gap-2">
						<label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
							<input
								type="checkbox"
								checked={availableOnly}
								onChange={(e) => setAvailableOnly(e.target.checked)}
								aria-label="Available now"
								className="h-4 w-4 accent-teal-700"
							/>
							Available now
						</label>
						<label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200" title="Active staff members who can take new bookings">
							<input
								type="checkbox"
								checked={newPatientsOnly}
								onChange={(e) => setNewPatientsOnly(e.target.checked)}
								aria-label="Accepting new patients"
								className="h-4 w-4 accent-teal-700"
							/>
							Accepting new patients
						</label>
					</div>
				</div>
				<div className="mt-4 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-700">
					<button
						type="button"
						onClick={clearFilters}
						className="rounded-full px-4 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-900/30"
					>
						Clear filters
					</button>
				</div>
			</section>

			{/* Doctor cards */}
			<div className="mt-6 grid w-full gap-5 grid-cols-auto gap-y-6">
				{visibleDoctors.map((item) => (
					<div
						key={item._id}
						role="button"
						tabIndex={0}
						onClick={() => navigate(`/appointment/${item._id}`)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") navigate(`/appointment/${item._id}`);
						}}
						className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/80"
					>
						<div className="overflow-hidden bg-teal-50 dark:bg-teal-900/30">
							<img
								className="h-44 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
								src={item.image}
								alt=""
							/>
						</div>
						<div className="flex flex-1 flex-col p-4">
							<div className={`flex items-center gap-2 text-xs ${item.available ? "text-green-700 dark:text-green-300" : "text-slate-500 dark:text-slate-400"}`}>
								<span className={`h-2 w-2 rounded-full ${item.available ? "bg-green-500" : "bg-slate-400"}`} />
								{item.available ? "Available" : "Unavailable"}
							</div>
							<p className="mt-2 text-base font-semibold text-gray-900 dark:text-slate-100">{item.name}</p>
							<p className="text-sm text-gray-600 dark:text-slate-300">{item.specialty}</p>
							<p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{item.experience} · {item.degree}</p>
							<p className="mt-auto pt-3 text-sm font-semibold text-teal-700 dark:text-teal-300">
								${priceOf(item)} <span className="font-normal text-gray-500 dark:text-slate-400">consultation</span>
							</p>
						</div>
					</div>
				))}
			</div>

			{visibleDoctors.length === 0 && (
				<p className="mt-10 text-center text-sm text-gray-500 dark:text-slate-400">
					No doctors match those filters. Try clearing them.
				</p>
			)}
		</div>
	);
};

export default Doctors;
