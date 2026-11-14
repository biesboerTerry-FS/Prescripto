import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getApiErrorMessage } from "../lib/api";

export const AppContext = createContext();

// Renders the App Context Provider UI.
const AppContextProvider = (props) => {
	const currencySymbol = "$";
	const backendURL = import.meta.env.VITE_BACKEND_URL;
	const [doctors, setDoctors] = useState([]);

	// ^ checks to see if token exists, if so it saves token to token state
	const [token, setToken] = useState(
		localStorage.getItem("token") ? localStorage.getItem("token") : false
	);
	const [userData, setUserData] = useState(false);

	// Helper that get doctors data.
	const getDoctorsData = async () => {
		try {
			const { data } = await api.get("/doctor/list");
			if (data.success) {
				setDoctors(data.doctors);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(getApiErrorMessage(error, "Could not load doctors."));
		}
	};

	// Helper that load user profile data.
	const loadUserProfileData = async () => {
		try {
			const { data } = await api.get("/user/get-profile", {
				skipAuthRedirect: true,
			});
			if (data.success) {
				setUserData(data.userData);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(getApiErrorMessage(error, "Could not load your profile."));
		}
	};

	const value = {
		doctors,
		getDoctorsData,
		currencySymbol,
		token,
		setToken,
		backendURL,
		userData,
		setUserData,
		loadUserProfileData,
	};

	useEffect(() => {
		getDoctorsData();
	}, []);

	useEffect(() => {
		if (token) {
			loadUserProfileData();
		} else {
			setUserData(false);
		}
	}, [token]);

	return (
		<AppContext.Provider value={value}>
			{props.children}
		</AppContext.Provider>
	);
};

export default AppContextProvider;
