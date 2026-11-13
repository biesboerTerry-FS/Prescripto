import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

// Renders the Doctors List view.
const DoctorsList = () => {
	const { doctors, adminToken, getAllDoctors, changeAvailability } =
		useContext(AdminContext);

	useEffect(() => {
		if (adminToken) {
			getAllDoctors();
		}
	}, [adminToken]);

	return (
		<div className="m-5 max-h-[90vh] overflow-y-scroll" tabIndex={0}>
			<h1 className="text-lg font-medium">All Doctors</h1>
			<div className="flex flex-wrap w-full gap-4 pt-5 gap-y-6">
				{doctors.map((item, index) => (
					<div
						className="overflow-hidden border border-teal-100 cursor-pointer rounded-xl max-w-56 group"
						key={index}
					>
						<img
							className="transition-all duration-500 bg-teal-50 group-hover:bg-primary"
							src={item.image}
							alt=""
						/>
						<div className="p-4">
							<p className="text-lg font-medium text-neutral-800">
								{item.name}
							</p>
							<p className="text-sm text-zinc-600">
								{item.specialty}
							</p>
							<div className="flex items-center gap-1 mt-2 text-sm">
								<input
									onChange={() =>
										changeAvailability(item._id)
									}
									type="checkbox"
									checked={item.available}
									aria-label={`${item.name} available for booking`}
								/>
								<p>Available</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default DoctorsList;
