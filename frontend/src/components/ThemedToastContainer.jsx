import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

const getTheme = () =>
	typeof document !== "undefined" && document.documentElement.classList.contains("dark")
		? "dark"
		: "light";

const ThemedToastContainer = () => {
	const [theme, setTheme] = useState(getTheme);

	useEffect(() => {
		const update = () => setTheme(getTheme());
		const observer = new MutationObserver(update);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		window.addEventListener("storage", update);
		return () => {
			observer.disconnect();
			window.removeEventListener("storage", update);
		};
	}, []);

	return (
		<ToastContainer
			theme={theme}
			position="top-right"
			autoClose={3500}
			hideProgressBar={false}
			newestOnTop
			closeOnClick
			pauseOnFocusLoss
			draggable
			pauseOnHover
		/>
	);
};

export default ThemedToastContainer;
