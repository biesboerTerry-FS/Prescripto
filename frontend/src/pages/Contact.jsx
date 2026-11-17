import React from "react";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

// Renders the Contact view.
const Contact = () => {
	return (
		<div>
			<div className="pt-10 text-2xl text-center text-gray-500">
				<p className="text-lg font-semibold text-gray-600">
					CONTACT
					<span className="font-semibold text-gray-700">US</span>
				</p>
			</div>

			<div className="flex flex-col justify-center gap-10 my-10 text-sm md:flex-row mb-28">
				<img
					className="w-full max-w-[360px] rounded-xl border border-slate-200"
					src={assets.contact_image}
					alt=""
				/>
				<div className="flex flex-col items-start justify-center gap-6">
					<p className="text-lg font-semibold text-gray-600">
						Our OFFICE
					</p>
					<p className="text-gray-500">
						31 Spooner Street <br />
						Quahog, Rhode Island, USA
					</p>
					<p className="text-gray-500">
						Tel: (314) 723-1421 <br />
						Email: thatdevterry@gmail.com
					</p>
					<p className="text-lg font-semibold text-gray-600">
						Careers at PRESCRIPTO
					</p>
					<p className="text-gray-500">
						Learn more about our teams and job openings.
					</p>
					<button
						onClick={() => toast.info("Reach out at thatdevterry@gmail.com — this is a portfolio project.")}
						className="px-8 py-4 text-sm font-medium text-white transition-colors duration-500 rounded-full bg-primary hover:bg-primary-dark"
					>
						Get in touch
					</button>
				</div>
			</div>
		</div>
	);
};

export default Contact;
