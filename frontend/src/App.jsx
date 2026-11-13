import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import MyAppointments from "./pages/MyAppointments";
import MyProfile from "./pages/MyProfile";
import Appointment from "./pages/Appointment";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Faqs from "./pages/Faqs";
import Sitemap from "./pages/Sitemap";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Renders the Scroll To Top UI.
const ScrollToTop = () => {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
};

// Renders the App UI.
const App = () => {
	return (
		// The page is at least the window's height and the footer sits at its
		// bottom, so there's never a blank band below the footer on short pages.
		<div className="flex min-h-screen flex-col">
			<NavBar />
			<main className="mx-4 flex-1 sm:mx-[10%]">
				<ToastContainer />
				<ScrollToTop />
				<ErrorBoundary>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/doctors" element={<Doctors />} />
						<Route path="/doctors/:specialty" element={<Doctors />} />
						<Route path="/about" element={<About />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/login" element={<Login />} />
						<Route path="/my-appointments" element={<MyAppointments />} />
						<Route path="/my-profile" element={<MyProfile />} />
						<Route
							path="/appointment/:doctorId"
							element={<Appointment />}
						/>
						<Route path="/privacy" element={<Privacy />} />
						<Route path="/terms" element={<Terms />} />
						<Route path="/faqs" element={<Faqs />} />
					<Route path="/sitemap" element={<Sitemap />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</ErrorBoundary>
			</main>
			<Footer />
		</div>
	);
};

export default App;
