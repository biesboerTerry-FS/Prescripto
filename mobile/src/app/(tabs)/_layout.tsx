import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";

// Tab bar icons get a ColorValue; Ionicons wants a plain string.
const tabIcon = (name: keyof typeof Ionicons.glyphMap) =>
	({ color, size }: { color: unknown; size: number }) => (
		<Ionicons name={name} size={size} color={color as string} />
	);

// Renders the Tabs Layout UI.
export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.textMuted,
				headerTintColor: colors.primary,
				headerTitleStyle: { color: colors.text, fontWeight: "700" },
				headerStyle: { backgroundColor: colors.surface },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					headerTitle: "Prescripto",
					tabBarIcon: tabIcon("home-outline"),
				}}
			/>
			<Tabs.Screen
				name="doctors"
				options={{
					title: "Doctors",
					tabBarIcon: tabIcon("medkit-outline"),
				}}
			/>
			<Tabs.Screen
				name="appointments"
				options={{
					title: "Appointments",
					tabBarIcon: tabIcon("calendar-outline"),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: tabIcon("person-outline"),
				}}
			/>
		</Tabs>
	);
}
