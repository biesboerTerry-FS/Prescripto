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
		if (!doctorInfo) return;

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
						doctorInfo.slots_booked?.[slotDate]?.includes(slotTime)
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
			<div className="pt-8 pb-4 sm:pt-12">
				{/* ---------------- Doctor Details ---------------- */}
				<div className="flex flex-col gap-4 sm:flex-row">
					<div>
						<img
							className="w-full rounded-lg bg-primary sm:max-w-72"
							src={doctorInfo.image}
							alt=""
						/>
					</div>
					<div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 py-8 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-800/80 mx-2 sm:mx-0 mt-[-80px] sm:mt-0 sm:p-9">
						{/* ---------------- Doctor info  ---------------- */}
						<p className="flex items-center gap-2 text-2xl font-medium text-gray-900 dark:text-slate-100">
							{doctorInfo.name}
							<img
								className="w-5"
								src={assets.verified_icon}
								alt=""
							/>
						</p>
						<div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-slate-300">
							<p>
								{doctorInfo.degree} - {doctorInfo.specialty}
							</p>
							<button className="rounded-full border border-slate-300 px-2.5 py-0.5 text-xs dark:border-slate-600">
								{doctorInfo.experience}
							</button>
						</div>
						{/* ---------------- About doctor ---------------- */}
						<div>
							<p className="flex items-center gap-1 mt-3 text-sm font-medium text-gray-900 dark:text-slate-100">
								About <img src={assets.info_icon} alt="" />
							</p>
							<p className="text-sm text-gray-500 max-w-[700px] mt-3 dark:text-slate-400">
								{doctorInfo.about}
							</p>
						</div>
						<p className="mt-4 font-medium text-gray-500 dark:text-slate-400">
							Appointment fee:{" "}
							<span className="text-gray-600 dark:text-slate-200">
								{currencySymbol}
								{doctorInfo.fees}
							</span>
						</p>
					</div>
				</div>
				{/* ---------------- Booking slots ---------------- */}
				<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 sm:ml-72 sm:p-6">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div>
							<h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
								Available slots
							</h2>
							<p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
								Pick a day, then a time that works for you.
							</p>
						</div>
						<div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
							<span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Selected
						</div>
					</div>

					{/* Day picker */}
					<div className="mt-5 flex gap-3 overflow-x-auto pb-2">
						{doctorSlots.length > 0 &&
							doctorSlots.map((item, index) => (
								<button
									type="button"
									key={index}
									onClick={() => setSlotIndex(index)}
									aria-pressed={slotIndex === index}
									className={`flex min-w-[4.5rem] shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-3 py-3.5 text-center transition-all duration-200 ${
										slotIndex === index
											? "border-teal-600 bg-primary text-white shadow-lg shadow-teal-900/20"
											: "border-slate-200 bg-slate-50/70 text-gray-600 hover:border-teal-400 hover:text-teal-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300"
									}`}
								>
									<span className="text-[11px] font-semibold tracking-wide">
										{item[0] && daysOfWeek[item[0].datetime.getDay()]}
									</span>
									<span className="text-xl font-semibold leading-none">
										{item[0] && item[0].datetime.getDate()}
									</span>
								</button>
							))}
					</div>

					{/* Time picker */}
					<div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
						{doctorSlots.length > 0 &&
							doctorSlots[slotIndex].map((item, index) => (
								<button
									type="button"
									key={index}
									onClick={() => setSlotTime(item.time)}
									aria-pressed={item.time === slotTime}
									className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
										item.time === slotTime
											? "border-teal-600 bg-primary text-white shadow-md shadow-teal-900/20"
											: "border-slate-200 bg-white text-gray-600 hover:border-teal-400 hover:text-teal-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300"
									}`}
								>
									{item.time.toLowerCase()}
								</button>
							))}
					</div>

					<button
						onClick={bookAppointment}
						className="mt-7 rounded-full bg-primary px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-primary-dark"
					>
						Schedule Appointment
					</button>
				</section>
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
