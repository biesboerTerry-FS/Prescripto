import { Stack, SplashScreen } from "expo-router";
import { SessionProvider, useSession } from "@/lib/session";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	return (
		<SessionProvider>
			<SplashGate />
			<RootStack />
		</SessionProvider>
	);
}

function SplashGate() {
	const { isLoading } = useSession();
	if (!isLoading) SplashScreen.hide();
	return null;
}

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
			</Stack.Protected>
			<Stack.Protected guard={!isLoading && !token}>
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			</Stack.Protected>
		</Stack>
	);
}
