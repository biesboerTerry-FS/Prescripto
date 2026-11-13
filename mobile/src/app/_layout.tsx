import { Stack, SplashScreen } from "expo-router";
import { SessionProvider, useSession } from "@/lib/session";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

// Renders the Root Layout UI.
export default function RootLayout() {
	return (
		<SessionProvider>
			<SplashGate />
			<RootStack />
		</SessionProvider>
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
	const { token } = useSession();
	return (
		<Stack
			screenOptions={{
				headerTintColor: colors.primary,
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text },
			}}
		>
			<Stack.Protected guard={!!token}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="doctor/[id]" options={{ title: "Book appointment" }} />
			</Stack.Protected>
			<Stack.Protected guard={!token}>
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			</Stack.Protected>
		</Stack>
	);
}
