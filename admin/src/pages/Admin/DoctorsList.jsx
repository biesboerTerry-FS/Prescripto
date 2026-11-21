import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

// Renders the Doctors List view as single-column rows.
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
			<div className="flex w-full flex-col gap-3 pt-5">
				{doctors.map((item, index) => (
					<div
						className="flex items-center gap-4 rounded-xl border border-teal-100 bg-white p-3 shadow-sm"
						data-testid="doctor-row"
						key={item._id ?? index}
					>
						<img
							className="h-16 w-16 shrink-0 rounded-lg bg-teal-50 object-cover"
							src={item.image}
							alt=""
						/>
						<div className="min-w-0 flex-1">
							<p className="truncate text-base font-medium text-neutral-800">
								{item.name}
							</p>
							<p className="truncate text-sm text-zinc-600">
								{item.specialty}
							</p>
						</div>
						<label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-sm text-zinc-600">
							<input
								onChange={() =>
									changeAvailability(item._id)
								}
								type="checkbox"
								checked={item.available}
								className="h-4 w-4 accent-primary"
								aria-label={`${item.name} available for booking`}
							/>
							Available
						</label>
					</div>
				))}
			</div>
		</div>
	);
};

export default DoctorsList;
