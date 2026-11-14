import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../lib/api";

// Renders the Appointment view.
const Appointment = () => {
	const { doctorId } = useParams();
	const { doctors, currencySymbol, token, getDoctorsData } =
		useContext(AppContext);
	const navigate = useNavigate();
	const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
	const [doctorInfo, setDoctorInfo] = useState(null);
	const [doctorSlots, setDoctorSlots] = useState([]);
	const [slotIndex, setSlotIndex] = useState(0);
	const [slotTime, setSlotTime] = useState("");

	// Helper that fetch doctor info.
	const fetchDoctorInfo = async () => {
		const doctorInfo = doctors.find((doctor) => doctor._id === doctorId);
		setDoctorInfo(doctorInfo);
	};

	// Helper that get available slots.
	const getAvailableSlots = async () => {
		// ^ Reset doctorSlots
		setDoctorSlots([]);

		//^ Start from the current date
		let today = new Date();

		for (let index = 0; index < 7; index++) {
			let currentDate = new Date(today);
			currentDate.setDate(today.getDate() + index);

			// ^ Skip weekends: Saturday (6) and Sunday (0)
			const dayOfWeek = currentDate.getDay();
			if (dayOfWeek === 0 || dayOfWeek === 6) continue;

			// ^ Set working hours (8 AM to 6 PM)
			let startTime = new Date(currentDate.setHours(8, 0, 0, 0));
			let endTime = new Date(currentDate.setHours(18, 0, 0, 0));

			// ^ Create slots in 30-minute intervals
			let timeSlots = [];
			while (startTime < endTime) {
				if (startTime > new Date()) {
					// ^ Only future slots
					let formattedTime = startTime.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					});

					let day = currentDate.getDate();
					let month = currentDate.getMonth() + 1;
					let year = currentDate.getFullYear();

					const slotDate = month + "/" + day + "/" + year;
					const slotTime = formattedTime;

					const isSlotAvailable =
						doctorInfo.slots_booked[slotDate] &&
						doctorInfo.slots_booked[slotDate].includes(slotTime)
							? false
							: true;

					if (isSlotAvailable) {
						// ^ Add slot to array
						timeSlots.push({
							datetime: new Date(startTime),
							time: formattedTime,
						});
					}
				}
				//^ Increment time by 30 minutes
				startTime.setMinutes(startTime.getMinutes() + 30);
			}

			//^ Add valid slots to doctorSlots
			if (timeSlots.length > 0) {
				setDoctorSlots((prev) => [...prev, timeSlots]);
			}
		}
	};

	// Helper that book appointment.
	const bookAppointment = async () => {
		if (!token) {
			toast.warn("Login to book appointment");
			return navigate("/login");
		}
		try {
			const date = doctorSlots[slotIndex][0].datetime;

			let day = date.getDate();
			let month = date.getMonth() + 1;
			let year = date.getFullYear();

			const slotDate = month + "/" + day + "/" + year;
			console.log(slotDate);
			const { data } = await api.post("/user/book-appointment", {
				doctorId,
				slotDate,
				slotTime,
			});
			if (data.success) {
				toast.success(data.message);
				getDoctorsData();
				navigate("/my-appointments");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(getApiErrorMessage(error, "Could not book appointment."));
		}
	};

	useEffect(() => {
		fetchDoctorInfo();
	}, [doctors, doctorId]);

	useEffect(() => {
		getAvailableSlots();
	}, [doctorInfo]);

	useEffect(() => {
		console.log(doctorSlots);
	}, [doctorSlots]);

	return (
		doctorInfo && (
			<div>
				{/* ---------------- Doctor Details ---------------- */}
				<div className="flex flex-col gap-4 sm:flex-row">
					<div>
						<img
							className="w-full rounded-lg bg-primary sm:max-w-72"
							src={doctorInfo.image}
							alt=""
						/>
					</div>
					<div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
						{/* ---------------- Doctor info  ---------------- */}
						<p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
							{doctorInfo.name}
							<img
								className="w-5"
								src={assets.verified_icon}
								alt=""
							/>
						</p>
						<div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
							<p>
								{doctorInfo.degree} - {doctorInfo.specialty}
							</p>
							<button className="py-0.5 px-2 border text-xs rounded-full">
								{doctorInfo.experience}
							</button>
						</div>
						{/* ---------------- About doctor ---------------- */}
						<div>
							<p className="flex items-center gap-1 mt-3 text-sm font-medium text-gray-900">
								About <img src={assets.info_icon} alt="" />
							</p>
							<p className="text-sm text-gray-500 max-w-[700px] mt-3">
								{doctorInfo.about}
							</p>
						</div>
						<p className="mt-4 font-medium text-gray-500">
							Appointment fee:{" "}
							<span className="text-gray-600">
								{currencySymbol}
								{doctorInfo.fees}
							</span>
						</p>
					</div>
				</div>
				{/* ---------------- Booking slots ---------------- */}
				<div className="mt-4 font-medium text-gray-700 sm:ml-72 sm:pl-4">
					<p>Available slots</p>
					<div className="flex items-center w-full gap-3 mt-4 overflow-x-scroll">
						{doctorSlots.length &&
							doctorSlots.map((item, index) => (
								<div
									onClick={() => setSlotIndex(index)}
									className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
										slotIndex === index
											? "bg-primary text-white"
											: "border border-gray-500"
									}`}
									key={index}
								>
									<p>
										{item[0] &&
											daysOfWeek[
												item[0].datetime.getDay()
											]}
									</p>
									<p>
										{item[0] && item[0].datetime.getDate()}
									</p>
								</div>
							))}
					</div>
					<div className="flex items-center w-full gap-3 mt-4 overflow-x-scroll">
						{doctorSlots.length &&
							doctorSlots[slotIndex].map((item, index) => (
								<p
									onClick={() => setSlotTime(item.time)}
									className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
										item.time === slotTime
											? "bg-primary text-white"
											: "text-gray-400 border border-gray-300"
									}`}
									key={index}
								>
									{item.time.toLowerCase()}
								</p>
							))}
					</div>
					<button
						onClick={bookAppointment}
						className="py-3 my-6 text-sm font-light text-white rounded-full bg-primary px-14"
					>
						Schedule Appointment
					</button>
				</div>
				{/* ---------------- Related Doctors ---------------- */}
				<RelatedDoctors
					doctorId={doctorId}
					specialty={doctorInfo.specialty}
				/>
			</div>
		)
	);
};

export default Appointment;
