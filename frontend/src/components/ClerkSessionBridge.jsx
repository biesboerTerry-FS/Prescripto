import { useContext, useEffect, useRef } from "react";
import { useAuth } from "@clerk/react";
import { AppContext } from "../context/AppContext";
import api from "../lib/api";

/**
 * Bridges a Clerk patient session to the existing backend JWT so current
 * /api/user/* flows keep working. Admin/doctor auth remains unchanged.
 */
export default function ClerkSessionBridge() {
	const { isLoaded, isSignedIn, getToken, userId } = useAuth();
	const { token, setToken, setUserData } = useContext(AppContext);
	const syncedForUser = useRef(null);

	useEffect(() => {
		if (!isLoaded) return;

		if (!isSignedIn) {
			syncedForUser.current = null;
			if (token) {
				localStorage.removeItem("token");
				setToken(false);
				setUserData(false);
			}
			return;
		}

		if (syncedForUser.current === userId && token) return;

		let cancelled = false;
		(async () => {
			try {
				const clerkToken = await getToken();
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
				if (data.success && data.token) {
					localStorage.setItem("token", data.token);
					setToken(data.token);
					syncedForUser.current = userId;
				}
			} catch (error) {
				console.log("Clerk sync failed", error);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isLoaded, isSignedIn, userId, getToken, token, setToken, setUserData]);

	return null;
}
