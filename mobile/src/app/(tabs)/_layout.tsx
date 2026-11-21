import { Pressable } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/ThemeContext";

// Tab bar icons get a ColorValue; Ionicons wants a plain string.
const tabIcon = (name: keyof typeof Ionicons.glyphMap) =>
	({ color, size }: { color: unknown; size: number }) => (
		<Ionicons name={name} size={size} color={color as string} />
	);

// Renders the Tabs Layout UI.
export default function TabsLayout() {
	const { dark, theme, toggleTheme } = useTheme();
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: theme.primary,
				tabBarInactiveTintColor: theme.textMuted,
				tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
				headerTintColor: theme.primary,
				headerTitleStyle: { color: theme.text, fontWeight: "700" },
				headerStyle: { backgroundColor: theme.surface },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					headerTitle: "Prescripto",
					tabBarIcon: tabIcon("home-outline"),
					headerRight: () => (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel={dark ? "Switch to light mode" : "Switch to dark mode"}
							onPress={toggleTheme}
							hitSlop={8}
							style={{ paddingHorizontal: 12, paddingVertical: 6 }}
						>
							<Ionicons
								name={dark ? "sunny-outline" : "moon-outline"}
								size={22}
								color={theme.primary}
							/>
						</Pressable>
					),
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
