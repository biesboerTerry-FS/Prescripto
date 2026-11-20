import axios from "axios";
import { toast } from "react-toastify";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
	baseURL: `${backendURL}/api`,
});

api.interceptors.request.use((config) => {
	const adminToken = localStorage.getItem("adminToken");
	const doctorToken = localStorage.getItem("doctorToken");
	if (doctorToken && config.url?.startsWith("/doctor/")) {
		config.headers.doctortoken = doctorToken;
	} else if (adminToken) {
		config.headers.adminToken = adminToken;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Doctor sessions are handled by the doctor portal, not the admin redirect.
		const isDoctorRoute = error.config?.url?.startsWith("/doctor/");
		if (
			error.response?.status === 401 &&
			!error.config?.skipAuthRedirect &&
			!isDoctorRoute
		) {
			toast.error("Your session has expired. Please sign in again.");
			localStorage.removeItem("adminToken");
			window.location.href = "/";
		}
		return Promise.reject(error);
	}
);

/**
 * Returns a user-friendly message for an axios or fetch error.
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
	if (!error) return fallback;
	if (!error.response) {
		return "Network error. Please check your connection and try again.";
	}
	const { status, data } = error.response;
	if (status === 401) {
		return "Your session has expired. Please sign in again.";
	}
	if (status === 403) {
		return "You don’t have permission to do that.";
	}
	if (status === 429) {
		return "Too many requests. Please wait a moment and try again.";
	}
	if (status >= 500) {
		return "Server error. Please try again later.";
	}
	return data?.message || fallback;
}

export default api;
