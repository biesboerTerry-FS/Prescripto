import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// Renders the Top Doctors UI.
const TopDoctors = () => {
	const navigate = useNavigate();
	const { doctors } = useContext(AppContext);

	return (
		<div className="flex flex-col items-center gap-4 my-16 text-gray-900">
			<h1 className="text-3xl font-medium">Top Doctors to Book</h1>
			<p className="text-sm text-center sm:w-1/3">
				Simply browse through our extensive list of trusted doctors
			</p>
			<div className="grid w-full px-3 grid-cols-auto gap-4 gap-y-6 sm:px-0">
				{doctors.slice(0, 10).map((item, index) => (
					<div
						onClick={() => {
							navigate(`/appointment/${item._id}`);
							scrollTo(0, 0);
						}}
						className="h-full flex flex-col border border-teal-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:translate-y-[-10px] transition-all duration-500"
						key={index}
					>
						<img className="bg-teal-50" src={item.image} alt="" />
						<div className="p-4 flex flex-1 flex-col">
							<div className="flex items-center gap-2 text-sm text-center text-green-700">
								<p className="w-2 h-2 bg-green-500 rounded-full"></p>
								<p>Available</p>
							</div>
							<p className="text-lg font-medium text-gray-900">
								{item.name}
							</p>
							<p className="mt-auto pt-1 text-sm text-gray-600">
								{item.specialty}
							</p>
						</div>
					</div>
				))}
			</div>
			<button
				onClick={() => {
					navigate("/doctors");
					scrollTo(0, 0);
				}}
				className="px-12 py-3 mt-10 text-sm font-medium text-white transition-colors rounded-full bg-primary hover:bg-primary-dark"
			>
				See more doctors
			</button>
		</div>
	);
};

export default TopDoctors;
