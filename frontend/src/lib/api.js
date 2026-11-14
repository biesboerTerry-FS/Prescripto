import axios from "axios";
import { toast } from "react-toastify";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
	baseURL: `${backendURL}/api`,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.token = token;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
			toast.error("Your session has expired. Please sign in again.");
			localStorage.removeItem("token");
			window.location.href = "/login";
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
