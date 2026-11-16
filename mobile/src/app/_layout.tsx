import { Stack, SplashScreen } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { SessionProvider, useSession } from "@/lib/session";
import { colors } from "@/lib/theme";
import ClerkSessionBridge from "@/lib/ClerkSessionBridge";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const tokenCache = {
	async getToken(key: string) {
		try {
			return await SecureStore.getItemAsync(key);
		} catch {
			return null;
		}
	},
	async saveToken(key: string, value: string) {
		try {
			await SecureStore.setItemAsync(key, value);
		} catch {}
	},
};

// Renders the Root Layout UI.
export default function RootLayout() {
	const content = (
		<SessionProvider>
			<SplashGate />
			<RootStack />
		</SessionProvider>
	);

	if (!publishableKey) return content;

	return (
		<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
			<ClerkLoaded>
				<SessionProvider>
					<ClerkSessionBridge />
					<SplashGate />
					<RootStack />
				</SessionProvider>
			</ClerkLoaded>
		</ClerkProvider>
	);
}

// Renders the Splash Gate UI.
function SplashGate() {
	const { isLoading } = useSession();
	if (!isLoading) {
		SplashScreen.hide();
	}
	return null;
}

// Stack.Protected: signed-out users only see (auth); signed-in users never see it.
function RootStack() {
	const { token, isLoading } = useSession();
	return (
		<Stack
			screenOptions={{
				headerTintColor: colors.primary,
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text },
			}}
		>
			<Stack.Protected guard={!isLoading && !!token}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="doctor/[id]" options={{ title: "Book appointment" }} />
			</Stack.Protected>
			<Stack.Protected guard={!isLoading && !token}>
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			</Stack.Protected>
		</Stack>
	);
}
