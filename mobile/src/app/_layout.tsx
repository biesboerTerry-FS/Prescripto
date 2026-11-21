import { Stack, SplashScreen } from "expo-router";
import { getStoredValue, setStoredValue, deleteStoredValue } from "@/lib/tokenStorage";
import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { SessionProvider, useSession } from "@/lib/session";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import ClerkSessionBridge from "@/lib/ClerkSessionBridge";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const tokenCache = {
	async getToken(key: string) {
		try {
			return await getStoredValue(key);
		} catch {
			return null;
		}
	},
	async saveToken(key: string, value: string) {
		try {
			await setStoredValue(key, value);
		} catch {}
	},
};

// Renders the Root Layout UI.
export default function RootLayout() {
	const content = (
		<ThemeProvider>
			<SessionProvider>
				<SplashGate />
				<RootStack />
			</SessionProvider>
		</ThemeProvider>
	);

	if (!publishableKey) return content;

	return (
		<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
			<ClerkLoaded>
				<ThemeProvider>
					<SessionProvider>
						<ClerkSessionBridge />
						<SplashGate />
						<RootStack />
					</SessionProvider>
				</ThemeProvider>
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
	const { theme } = useTheme();
	return (
		<Stack
			screenOptions={{
				headerTintColor: theme.primary,
				headerStyle: { backgroundColor: theme.surface },
				headerTitleStyle: { color: theme.text },
				contentStyle: { backgroundColor: theme.background },
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
