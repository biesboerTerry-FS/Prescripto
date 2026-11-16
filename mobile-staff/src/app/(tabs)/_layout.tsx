import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
	return (
		<Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
			<Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }} />
			<Tabs.Screen name="doctors" options={{ title: "Doctors", tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" color={color} size={size} /> }} />
			<Tabs.Screen name="appointments" options={{ title: "Appointments", tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} /> }} />
			<Tabs.Screen name="patients" options={{ title: "Patients", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} /> }} />
			<Tabs.Screen name="profile" options={{ title: "Account", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} /> }} />
		</Tabs>
	);
}
