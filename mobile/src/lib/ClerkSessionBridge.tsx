import { useAuth } from "@clerk/expo";
import { useEffect, useRef } from "react";
import { syncClerkSession } from "@/lib/api";
import { useSession } from "@/lib/session";

/**
 * Bridges Clerk patient auth to the backend JWT used by existing mobile APIs.
 */
export default function ClerkSessionBridge() {
	const { isLoaded, isSignedIn, getToken, userId } = useAuth();
	const { token, signIn, signOut } = useSession();
	const syncedForUser = useRef<string | null>(null);

	useEffect(() => {
		if (!isLoaded) return;

		if (!isSignedIn) {
			syncedForUser.current = null;
			if (token) void signOut();
			return;
		}

		if (syncedForUser.current === userId && token) return;

		let cancelled = false;
		(async () => {
			try {
				const clerkToken = await getToken();
				if (!clerkToken || cancelled) return;
				const backendToken = await syncClerkSession(clerkToken);
				if (cancelled) return;
				await signIn(backendToken);
				syncedForUser.current = userId ?? "clerk-user";
			} catch (e) {
				console.log("Clerk mobile sync failed", e);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isLoaded, isSignedIn, userId, getToken, token, signIn, signOut]);

	return null;
}
