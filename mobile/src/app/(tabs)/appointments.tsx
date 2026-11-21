import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { ApiError, cancelAppointment, getAppointments } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/ThemeContext";
import type { ThemeColors } from "@/lib/theme";
import type { Appointment } from "@/lib/types";

// Helper that renders a status badge for an appointment.
function statusBadge(item: Appointment) {
	if (item.cancelled) return <Badge label="Cancelled" tone="red" />;
	if (item.payment) return <Badge label="Paid" tone="teal" />;
	return <Badge label="Pending payment" tone="amber" />;
}

// Screen component for appointments in the mobile app.
export default function AppointmentsScreen() {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
	const { token } = useSession();
	const [items, setItems] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const load = useCallback(async () => {
		if (!token) return;
		try {
			setItems(await getAppointments(token));
		} catch (error) {
			if (error instanceof ApiError) {
				Alert.alert("Could not load appointments", error.message);
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [token]);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);

	// Helper that confirm cancel.
	const confirmCancel = (item: Appointment) => {
		Alert.alert("Cancel appointment?", `${item.doctorData.name} · ${item.slotDate} ${item.slotTime}`, [
			{ text: "Keep it", style: "cancel" },
			{
				text: "Cancel appointment",
				style: "destructive",
				onPress: async () => {
					if (!token) return;
					try {
						await cancelAppointment(token, item._id);
						await load();
					} catch (error) {
						Alert.alert("Could not cancel", error instanceof ApiError ? error.message : "Please try again.");
					}
				},
			},
		]);
	};

	return (
		<FlatList
			data={items}
			keyExtractor={(item) => item._id}
			style={styles.list}
			contentContainerStyle={styles.content}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => {
						setRefreshing(true);
						load();
					}}
					tintColor={theme.primary}
				/>
			}
			ListEmptyComponent={
				loading ? (
					<ActivityIndicator style={styles.loader} color={theme.primary} />
				) : (
					<EmptyState title="No appointments yet" body="Book a doctor from the Doctors tab to see it here." />
				)
			}
			renderItem={({ item }) => (
				<Card style={styles.card}>
					<View style={styles.row}>
						<Image source={{ uri: item.doctorData.image }} style={styles.avatar} />
						<View style={styles.info}>
							<Text style={styles.name}>{item.doctorData.name}</Text>
							<Text style={styles.specialty}>{item.doctorData.specialty}</Text>
							<Text style={styles.when}>
								{item.slotDate} · {item.slotTime}
							</Text>
							<Text style={styles.fee}>${item.amount}</Text>
						</View>
					</View>
					<View style={styles.footer}>
						{statusBadge(item)}
						{!item.cancelled && (
							<Button label="Cancel" variant="danger" onPress={() => confirmCancel(item)} style={styles.cancel} />
						)}
					</View>
				</Card>
			)}
			ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
		/>
	);

}

const makeStyles = (theme: ThemeColors) =>
	StyleSheet.create({
		list: { flex: 1, backgroundColor: theme.background },
		content: { padding: 16, paddingBottom: 32, flexGrow: 1, backgroundColor: theme.background },
		loader: { marginTop: 48 },
		card: { gap: 12 },
		row: { flexDirection: "row", gap: 12 },
		avatar: { width: 64, height: 64, borderRadius: 12, backgroundColor: theme.primarySoft },
		info: { flex: 1, gap: 2 },
		name: { fontSize: 16, fontWeight: "600", color: theme.text },
		specialty: { fontSize: 13, color: theme.textMuted },
		when: { fontSize: 13, color: theme.text, marginTop: 4 },
		fee: { fontSize: 13, color: theme.primary, fontWeight: "600" },
		footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
		cancel: { minHeight: 36, paddingHorizontal: 16 },
	});
