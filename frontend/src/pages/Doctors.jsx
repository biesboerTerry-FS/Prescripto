import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// Renders the Doctors view.
const Doctors = () => {
	const [filterDoctors, setFilterDoctors] = useState([]);
	const navigate = useNavigate();

	const { specialty } = useParams();
	const { doctors } = useContext(AppContext);
	const [showFilter, setShowFilter] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [query, setQuery] = useState("");

	// Helper that apply filter.
	const applyFilter = () => {
		const term = query.trim().toLowerCase();
		setFilterDoctors(
			doctors.filter(
				(doctor) =>
					(!specialty || doctor.specialty === specialty) &&
					(!term ||
						doctor.name.toLowerCase().includes(term) ||
						doctor.specialty.toLowerCase().includes(term))
			)
		);
	};

	useEffect(() => {
		applyFilter();
	}, [doctors, specialty, query]);

	return (
		<div>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-gray-600">Browse by Specialty</p>
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search by name or specialty"
					aria-label="Search doctors"
					className="w-full px-4 py-2 text-sm border rounded-full border-gray-300 sm:w-72 focus:border-teal-500 focus:outline-none"
				/>
			</div>
			<div className="flex flex-col items-start gap-5 mt-5 sm:flex-row">
				<button
					className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
						showFilter ? `bg-primary text-white` : ""
					}`}
					onClick={() => setShowFilter((prev) => !prev)}
				>
					Filter
				</button>
				<button
					type="button"
					onClick={() => setSidebarCollapsed((v) => !v)}
					aria-expanded={!sidebarCollapsed}
					aria-label={sidebarCollapsed ? "Show specialties" : "Hide specialties"}
					title={sidebarCollapsed ? "Show specialties" : "Hide specialties"}
					className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border text-lg leading-none text-gray-600 hover:border-teal-500 hover:text-teal-700 transition-colors"
				>
					<span className={`inline-block transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""}`}>‹</span>
				</button>
				<div
					className={`flex-col gap-4 text-sm text-gray-600 ${
						showFilter ? `flex` : `hidden`
					} ${sidebarCollapsed ? `sm:hidden` : `sm:flex`}`}
				>
					<p
						onClick={() =>
							specialty === "General Physician"
								? navigate("/doctors")
								: navigate("/doctors/General Physician")
						}
						className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer hover:border-teal-500 hover:text-teal-700 ${
							specialty === "General Physician"
								? "border-teal-600 bg-teal-100 font-medium text-teal-900"
								: ""
						}`}
					>
						General Physician
					</p>
					<p
						onClick={() =>
							specialty === "Gynecologist"
								? navigate("/doctors")
								: navigate("/doctors/Gynecologist")
						}
						className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer hover:border-teal-500 hover:text-teal-700 ${
							specialty === "Gynecologist"
								? "border-teal-600 bg-teal-100 font-medium text-teal-900"
								: ""
						}`}
					>
						Gynecologist
					</p>
					<p
						onClick={() =>
							specialty === "Dermatologist"
								? navigate("/doctors")
								: navigate("/doctors/Dermatologist")
						}
						className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer hover:border-teal-500 hover:text-teal-700 ${
							specialty === "Dermatologist"
								? "border-teal-600 bg-teal-100 font-medium text-teal-900"
								: ""
						}`}
					>
						Dermatologist
					</p>
					<p
						onClick={() =>
							specialty === "Pediatrician"
								? navigate("/doctors")
								: navigate("/doctors/Pediatrician")
						}
						className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer hover:border-teal-500 hover:text-teal-700 ${
							specialty === "Pediatrician"
								? "border-teal-600 bg-teal-100 font-medium text-teal-900"
								: ""
						}`}
					>
						Pediatrician
					</p>
					<p
						onClick={() =>
							specialty === "Neurologist"
								? navigate("/doctors")
								: navigate("/doctors/Neurologist")
						}
						className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer hover:border-teal-500 hover:text-teal-700 ${
							specialty === "Neurologist"
								? "border-teal-600 bg-teal-100 font-medium text-teal-900"
								: ""
						}`}
					>
						Neurologist
					</p>
					<p
						onClick={() =>
							specialty === "Gastroenterologist"
								? navigate("/doctors")
								: navigate("/doctors/Gastroenterologist")
						}
						className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer hover:border-teal-500 hover:text-teal-700 ${
							specialty === "Gastroenterologist"
								? "border-teal-600 bg-teal-100 font-medium text-teal-900"
								: ""
						}`}
					>
						Gastroenterologist
					</p>
				</div>
				<div className="grid w-full gap-4 grid-cols-auto gap-y-6">
					{filterDoctors.map((item, index) => (
						<div
							onClick={() => navigate(`/appointment/${item._id}`)}
							className="h-full flex flex-col border border-teal-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:translate-y-[-10px] transition-all duration-500"
							key={index}
						>
							<img
								className="bg-teal-50"
								src={item.image}
								alt=""
							/>
							<div className="p-4 flex flex-1 flex-col">
								<div className="flex items-center gap-2 text-sm text-center text-green-700">
									<p className="w-2 h-2 bg-green-500 rounded-full"></p>
									<p>Available</p>
								</div>
								<p className="text-lg font-medium text-gray-900">
									{item.name}
								</p>
								<p className="text-sm text-gray-600">
									{item.specialty}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Doctors;
