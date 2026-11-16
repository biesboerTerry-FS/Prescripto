import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSession } from "@/lib/session";
import { ApiError, cancelAppointment, getAllAppointments } from "@/lib/api";
import { Button, Card } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function AppointmentsScreen() {
	const { token } = useSession();
	const [items, setItems] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const load = useCallback(async () => {
		if (!token) return;
		try {
			setError(null);
			setItems(await getAllAppointments(token));
		} catch (e) {
			setError(e instanceof ApiError ? e.message : "Could not load appointments.");
		}
	}, [token]);

	useEffect(() => { load(); }, [load]);

	const onCancel = (appointmentId: string) => {
		Alert.alert("Cancel appointment", "Cancel this appointment?", [
			{ text: "No", style: "cancel" },
			{ text: "Yes", style: "destructive", onPress: async () => {
				if (!token) return;
				try { await cancelAppointment(token, appointmentId); await load(); }
				catch (e) { Alert.alert("Error", e instanceof ApiError ? e.message : "Could not cancel."); }
			}},
		]);
	};

	return (
		<FlatList
			style={styles.container}
			contentContainerStyle={styles.content}
			data={items}
			keyExtractor={(item) => item._id}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
			ListHeaderComponent={<><Text style={styles.title}>Appointments</Text>{error ? <Text style={styles.error}>{error}</Text> : null}</>}
			renderItem={({ item }) => (
				<Card style={styles.card}>
					<View style={{ flex: 1, gap: 2 }}>
						<Text style={styles.name}>{item.docData?.name || "Doctor"} · {item.userData?.name || "Patient"}</Text>
						<Text style={styles.meta}>{item.slotDate} {item.slotTime}</Text>
						<Text style={styles.meta}>{item.cancelled ? "Cancelled" : item.isCompleted ? "Completed" : "Scheduled"} · {item.payment ? "Paid" : "Unpaid"}</Text>
					</View>
					{!item.cancelled ? <Button label="Cancel" variant="outline" onPress={() => onCancel(item._id)} /> : null}
				</Card>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	content: { padding: 16, gap: 10 },
	title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 4 },
	error: { color: "#b91c1c", marginBottom: 8 },
	card: { padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
	name: { fontSize: 15, fontWeight: "700", color: colors.text },
	meta: { fontSize: 13, color: colors.textMuted },
});
