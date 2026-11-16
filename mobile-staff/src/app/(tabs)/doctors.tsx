import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Switch, Text, View } from "react-native";
import { useSession } from "@/lib/session";
import { ApiError, changeAvailability, getAllDoctors } from "@/lib/api";
import { Card } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function DoctorsScreen() {
	const { token } = useSession();
	const [doctors, setDoctors] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const load = useCallback(async () => {
		if (!token) return;
		try {
			setError(null);
			setDoctors(await getAllDoctors(token));
		} catch (e) {
			setError(e instanceof ApiError ? e.message : "Could not load doctors.");
		}
	}, [token]);

	useEffect(() => { load(); }, [load]);

	const toggle = async (doctorId: string) => {
		if (!token) return;
		try {
			await changeAvailability(token, doctorId);
			await load();
		} catch (e) {
			setError(e instanceof ApiError ? e.message : "Could not update availability.");
		}
	};

	return (
		<FlatList
			style={styles.container}
			contentContainerStyle={styles.content}
			data={doctors}
			keyExtractor={(item) => item._id}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
			ListHeaderComponent={<><Text style={styles.title}>Doctors</Text>{error ? <Text style={styles.error}>{error}</Text> : null}</>}
			renderItem={({ item }) => (
				<Card style={styles.card}>
					<View style={{ flex: 1 }}>
						<Text style={styles.name}>{item.name}</Text>
						<Text style={styles.meta}>{item.specialty} · {item.experience || ""}</Text>
						<Text style={styles.meta}>Fees: ${item.fees ?? "—"} · Available</Text>
					</View>
					<Switch value={!!item.available} onValueChange={() => toggle(item._id)} />
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
	name: { fontSize: 16, fontWeight: "700", color: colors.text },
	meta: { fontSize: 13, color: colors.textMuted },
});
