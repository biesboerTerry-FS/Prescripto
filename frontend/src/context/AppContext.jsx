import { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
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

	// A Clerk session is the patient's primary sign-in. Exchange it for the
	// existing backend patient JWT so booking/profile APIs keep working.
	const { isLoaded: clerkLoaded, isSignedIn, getToken } = useAuth();
	const getClerkTokenRef = useRef(getToken);
	getClerkTokenRef.current = getToken;
	const [clerkSynced, setClerkSynced] = useState(false);

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

	// Sign a Clerk-authenticated patient into the existing patient API.
	useEffect(() => {
		if (!clerkLoaded || !isSignedIn) return undefined;
		let cancelled = false;

		const syncClerkSession = async () => {
			try {
				const clerkToken = await getClerkTokenRef.current();
				if (!clerkToken || cancelled) return;
				const { data } = await api.post(
					"/user/clerk-sync",
					{},
					{
						headers: { Authorization: `Bearer ${clerkToken}` },
						skipAuthRedirect: true,
					}
				);
				if (cancelled) return;
				if (data?.success && data.token) {
					localStorage.setItem("token", data.token);
					setToken(data.token);
					setClerkSynced(true);
				} else if (data?.message) {
					console.warn("Clerk patient sign-in could not be synced:", data.message);
				}
			} catch (error) {
				if (!cancelled) {
					console.warn("Clerk patient sign-in could not be synced:", error);
				}
			}
		};

		syncClerkSession();
		return () => {
			cancelled = true;
		};
	}, [clerkLoaded, isSignedIn]);

	// Signing out of Clerk also ends the patient API session it created.
	useEffect(() => {
		if (clerkLoaded && !isSignedIn && clerkSynced) {
			localStorage.removeItem("token");
			setToken(false);
			setUserData(false);
			setClerkSynced(false);
		}
	}, [clerkLoaded, isSignedIn, clerkSynced]);

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
