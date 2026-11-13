import { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// Google's OpenID Connect endpoint. The app gets an ID token here and sends it to
// POST /api/user/oauth-google, where the backend verifies it with google-auth-library.
const discovery = {
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Hook that use google sign in.
export function useGoogleSignIn(onIdToken: (idToken: string) => void, onError: (message: string) => void) {
	const redirectUri = AuthSession.makeRedirectUri({ scheme: "prescripto", path: "auth" });
	const [nonce] = useState(() => Crypto.randomUUID());

	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId: GOOGLE_CLIENT_ID,
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
		enabled: GOOGLE_CLIENT_ID.length > 0,
		ready: Boolean(request),
		promptAsync,
	};
}
