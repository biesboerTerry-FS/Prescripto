import { useEffect, useMemo, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// Google's OpenID Connect endpoint. The app gets an ID token here and sends it to
// POST /api/user/oauth-google, where the backend verifies it with google-auth-library.
const discovery = {
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

// Client IDs can be set per platform. The backend GOOGLE_CLIENT_ID accepts a
// comma-separated list, so the same backend can verify tokens from the web app,
// Expo Go, iOS, and Android clients.
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";

function getPlatformClientId(): string {
	if (Platform.OS === "ios" && GOOGLE_IOS_CLIENT_ID) return GOOGLE_IOS_CLIENT_ID;
	if (Platform.OS === "android" && GOOGLE_ANDROID_CLIENT_ID) return GOOGLE_ANDROID_CLIENT_ID;
	return GOOGLE_CLIENT_ID;
}

// Hook that use google sign in.
export function useGoogleSignIn(onIdToken: (idToken: string) => void, onError: (message: string) => void) {
	const clientId = useMemo(() => getPlatformClientId(), []);
	const redirectUri = useMemo(
		() => AuthSession.makeRedirectUri({ scheme: "prescripto", path: "auth" }),
		[]
	);
	const [nonce] = useState(() => Crypto.randomUUID());

	if (__DEV__ && clientId) {
		// eslint-disable-next-line no-console
		console.log("Google OAuth redirect URI:", redirectUri);
	}

	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId,
			responseType: AuthSession.ResponseType.IdToken,
			scopes: ["openid", "profile", "email"],
			redirectUri,
			extraParams: { nonce },
		},
		discovery
	);

	useEffect(() => {
		if (!response) return;
		if (response.type === "success") {
			const idToken = response.params.id_token;
			if (idToken) {
				onIdToken(idToken);
			} else {
				onError("Google did not return an ID token.");
			}
		} else if (response.type === "error") {
			onError(response.error?.message ?? "Google sign-in failed.");
		}
	}, [response]);

	return {
		enabled: clientId.length > 0,
		ready: Boolean(request),
		redirectUri,
		promptAsync,
	};
}
