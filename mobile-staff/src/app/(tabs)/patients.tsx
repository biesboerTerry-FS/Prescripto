import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSession } from "@/lib/session";
import { ApiError, getAllPatients } from "@/lib/api";
import { Card } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function PatientsScreen() {
	const { token } = useSession();
	const [items, setItems] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const load = useCallback(async () => {
		if (!token) return;
		try {
			setError(null);
			setItems(await getAllPatients(token));
		} catch (e) {
			setError(e instanceof ApiError ? e.message : "Could not load patients.");
		}
	}, [token]);

	useEffect(() => { load(); }, [load]);

	return (
		<FlatList
			style={styles.container}
			contentContainerStyle={styles.content}
			data={items}
			keyExtractor={(item) => item._id}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
			ListHeaderComponent={<><Text style={styles.title}>Patients</Text>{error ? <Text style={styles.error}>{error}</Text> : null}</>}
			renderItem={({ item }) => (
				<Card style={styles.card}>
					<Text style={styles.name}>{item.name || "Patient"}</Text>
					<Text style={styles.meta}>{item.email || "—"}</Text>
					<Text style={styles.meta}>{item.phone && item.phone !== "0000000000" ? item.phone : "No phone"}</Text>
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
	card: { padding: 14, gap: 4 },
	name: { fontSize: 16, fontWeight: "700", color: colors.text },
	meta: { fontSize: 13, color: colors.textMuted },
});
