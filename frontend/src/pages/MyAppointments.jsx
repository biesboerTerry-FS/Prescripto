import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Builds an .ics calendar event for a booking (30-minute visit, local time)
const pad = (n) => String(n).padStart(2, "0");
// Helper that formats a date/time for an iCalendar timestamp.
const toIcsStamp = (date) =>
	`${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
		date.getHours()
	)}${pad(date.getMinutes())}00`;

// Helper that builds and downloads an.ics file for an appointment.
const addToCalendar = (item) => {
	const [month, day, year] = item.slotDate.split("/").map(Number);
	const [clock, suffix] = item.slotTime.split(" ");
	let [hours, minutes] = clock.split(":").map(Number);
	if (suffix === "PM" && hours !== 12) hours += 12;
	if (suffix === "AM" && hours === 12) hours = 0;

	const start = new Date(year, month - 1, day, hours, minutes);
	const end = new Date(start.getTime() + 30 * 60 * 1000);
	const address = [item.doctorData.address?.line1, item.doctorData.address?.line2]
		.filter(Boolean)
		.join(", ");
	const ics = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Prescripto//Appointments//EN",
		"BEGIN:VEVENT",
		`UID:${item._id}@prescripto`,
		`DTSTAMP:${toIcsStamp(new Date())}`,
		`DTSTART:${toIcsStamp(start)}`,
		`DTEND:${toIcsStamp(end)}`,
		`SUMMARY:Appointment with ${item.doctorData.name}`,
		`DESCRIPTION:${item.doctorData.specialty} visit booked through Prescripto`,
		address ? `LOCATION:${address}` : "",
		"BEGIN:VALARM",
		"TRIGGER:-PT60M",
		"ACTION:DISPLAY",
		"DESCRIPTION:Appointment in one hour",
		"END:VALARM",
		"END:VEVENT",
		"END:VCALENDAR",
	]
		.filter(Boolean)
		.join("\r\n");

	const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = `prescripto-${item.slotDate.replace(/\//g, "-")}.ics`;
	link.click();
	URL.revokeObjectURL(url);
};

// Renders the My Appointments view.
const MyAppointments = () => {
	const { backendURL, token, getDoctorsData } = useContext(AppContext);
	const [appointments, setAppointments] = useState([]);

	// Helper that get user appointments.
	const getUserAppointments = async () => {
		try {
			const { data } = await axios.get(
				`${backendURL}/api/user/appointments`,
				{ headers: { token } }
			);

			if (data.success) {
				setAppointments(data.appointments.reverse());
				console.log(data.appointments);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	// Helper that pay online.
	const payOnline = async (appointmentId) => {
		try {
			const { data } = await axios.post(
				`${backendURL}/api/user/create-payment`,
				{ appointmentId },
				{ headers: { token } }
			);
			if (data.success) {
				// Placeholder: with a live Stripe key this would open
				// Stripe Checkout using data.clientSecret.
				toast.info("Stripe checkout would open here (placeholder mode)");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			// 503 = Stripe not configured on the server (demo mode)
			const message =
				error?.response?.data?.message || "Payment is unavailable";
			toast.info(`${message} — this appointment stays booked for free.`);
		}
	};

	// Helper that cancel appointment.
	const cancelAppointment = async (appointmentId) => {
		try {
			// console.log( appointmentId );
			const { data } = await axios.put(
				`${backendURL}/api/user/cancel-appointment`,
				{ appointmentId },
				{ headers: { token } }
			);
			if (data.success) {
				toast.success(data.message);
				getUserAppointments();
				getDoctorsData();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	useEffect(() => {
		if (token) {
			getUserAppointments();
		}
	}, [token]);

	return (
		<div>
			<p className="pb-3 mt-12 font-medium border-b text-zinc-700">
				My Appointments
			</p>
			<div>
				{appointments.map((item, index) => (
					<div
						className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
						key={index}
					>
						<div>
							<img
								className="w-32 bg-teal-50"
								src={item.doctorData.image}
								alt=""
							/>
						</div>

						<div className="flex-1 text-sm text-zinc-600">
							<p className="font-semibold text-neutral-800">
								{item.doctorData.name}
							</p>
							<p>{item.doctorData.specialty}</p>
							<p className="mt-1 font-medium text-zinc-700">
								Address:
							</p>
							<p className="text-xs">
								{item.doctorData.address.line1}
							</p>
							<p className="text-xs">
								{item.doctorData.address.line2}
							</p>
							<p className="mt-1 text-xs">
								<span className="text-sm font-medium text-neutral-700">
									Date & Time: <br />
								</span>
								{item.slotDate} | {item.slotTime}
							</p>
						</div>
						<div></div>
						<div className="flex flex-col justify-end gap-2">
							{!item.cancelled && !item.payment && (
								<button
									onClick={() => payOnline(item._id)}
									className="py-2 text-sm text-center transition-all duration-300 border rounded text-stone-500 sm:min-w-48 hover:bg-primary hover:text-white"
								>
									Pay online now
								</button>
							)}
							{!item.cancelled && (
								<button
									onClick={() => addToCalendar(item)}
									className="py-2 text-sm text-center transition-all duration-300 border rounded text-stone-500 sm:min-w-48 hover:border-teal-500 hover:text-teal-700"
								>
									Add to calendar
								</button>
							)}
							{!item.cancelled && item.payment && (
								<span className="py-2 text-sm text-center border rounded text-teal-700 bg-teal-50 border-teal-200 sm:min-w-48">
									Paid ✓
								</span>
							)}

							{!item.cancelled && (
								<button
									onClick={() => cancelAppointment(item._id)}
									className="py-2 text-sm text-center transition-all duration-300 border rounded text-stone-500 sm:min-w-48 hover:bg-red-600 hover:text-white"
								>
									Cancel appointment
								</button>
							)}
							{item.cancelled && (
								<button className="py-2 text-red-500 border-red-500 rounded sm:min-w-48">
									Appointment Cancelled
								</button>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default MyAppointments;
