import { useEffect } from "react";
import { toast } from "react-toastify";

// Shows toast notifications when the browser goes offline/online.
const NetworkStatus = () => {
	useEffect(() => {
		const onOffline = () => toast.error("You're offline. Check your connection.");
		const onOnline = () => toast.success("You're back online.");

		window.addEventListener("offline", onOffline);
		window.addEventListener("online", onOnline);

		return () => {
			window.removeEventListener("offline", onOffline);
			window.removeEventListener("online", onOnline);
		};
	}, []);

	return null;
};

export default NetworkStatus;
