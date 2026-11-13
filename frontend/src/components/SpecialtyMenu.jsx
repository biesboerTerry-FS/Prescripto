import React, { useEffect, useState } from "react";
import { specialtyData } from "../assets/assets";
import { Link, useLocation } from "react-router-dom";

// Renders the Specialty Menu UI.
const SpecialtyMenu = () => {
	const [open, setOpen] = useState(false);
	const location = useLocation();

	// Open the list when navigating to the #specialty section (e.g. hero CTA).
	useEffect(() => {
		if (location.hash === "#specialty") {
			setOpen(true);
		}
	}, [location.hash]);

	return (
		<div
			className="flex flex-col items-center gap-4 py-16 text-gray-800"
			id="specialty"
		>
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				aria-expanded={open}
				aria-controls="specialty-list"
				className="flex items-center gap-2 text-3xl font-medium text-gray-800 transition-colors hover:text-teal-700"
			>
				Find by Specialty
				<span
					aria-hidden="true"
					className={`inline-block text-base transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				>
					▾
				</span>
			</button>
			<p className="text-sm text-center sm:w-1/3">
				Simply browse through our extensive list of trusted doctors,{" "}
				<br className="hidden sm:block" /> and schedule your appointment
				hassle-free
			</p>
			{open && (
				<div
					id="specialty-list"
					className="flex w-full gap-5 pt-5 overflow-x-scroll sm:justify-center"
				>
					{specialtyData.map((item, index) => (
						<Link
							onClick={() => scrollTo(0, 0)}
							className="flex flex-col items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer flex-shrink-0 transition-all duration-300 hover:-translate-y-1.5 hover:text-teal-700"
							key={index}
							to={`/doctors/${item.specialty}`}
						>
							<span className="block w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-md ring-1 ring-teal-100 overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:ring-teal-300">
								<img
									className="w-full h-full object-cover"
									src={item.image}
									alt={`${item.specialty} icon`}
								/>
							</span>
							<span className="text-center leading-tight">
								{item.specialty}
							</span>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default SpecialtyMenu;
