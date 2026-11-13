import React from "react";
import { assets } from "../assets/assets";

// Renders the Header UI.
const Header = () => {
	return (
		<header className="relative left-1/2 -translate-x-1/2 w-screen px-4 sm:px-[10%] hero-bg shadow-md">
			<div className="flex flex-col flex-wrap md:flex-row">
				<div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
					<p className="text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl md:leading-tight lg:leading-tight">
						Book an Appointment <br />
						with Trusted Doctors
					</p>
					<div className="flex flex-col items-center gap-3 text-sm font-light text-white md:flex-row">
						<img className="w-28" src={assets.group_profiles} alt="" />
						<p>
							Simply browse through our extensive list of trusted
							doctors, <br className="hidden sm:block" /> and
							schedule your appointment hassle-free
						</p>
					</div>
					<a
						className="flex items-center px-8 py-3 m-auto text-sm font-medium text-teal-800 transition-all duration-300 bg-white rounded-full ga2 hover:scale-105"
						href="#specialty"
					>
						Book Appointment{" "}
						<img className="w-3 ml-2" src={assets.arrow_icon} alt="" />
					</a>
				</div>
				<div className="relative md:w-1/2">
					<img
						className="hero-img-light bottom-0 w-full h-auto md:absolute"
						src={assets.header_img}
						alt=""
					/>
					<img
						className="hero-img-dark bottom-0 w-full h-auto md:absolute"
						src={assets.header_img_dark}
						alt=""
					/>
				</div>
			</div>
		</header>
	);
};

export default Header;
