import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSession } from "@/lib/session";
import { ApiError, getDashboard } from "@/lib/api";
import { Card } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function DashboardScreen() {
	const { token } = useSession();
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const load = useCallback(async () => {
		if (!token) return;
		try {
			setError(null);
			const res = await getDashboard(token);
			setData(res.dashData);
		} catch (e) {
			setError(e instanceof ApiError ? e.message : "Could not load dashboard.");
		}
	}, [token]);

	useEffect(() => { load(); }, [load]);

	const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
			<Text style={styles.title}>Admin Dashboard</Text>
			<Text style={styles.subtitle}>Doctor portal APIs are not yet available; admin tools are active.</Text>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<View style={styles.grid}>
				<Card style={styles.stat}><Text style={styles.statLabel}>Doctors</Text><Text style={styles.statValue}>{data?.doctors ?? "—"}</Text></Card>
				<Card style={styles.stat}><Text style={styles.statLabel}>Patients</Text><Text style={styles.statValue}>{data?.patients ?? "—"}</Text></Card>
				<Card style={styles.stat}><Text style={styles.statLabel}>Appointments</Text><Text style={styles.statValue}>{data?.appointments ?? "—"}</Text></Card>
			</View>
			<Card style={styles.block}>
				<Text style={styles.blockTitle}>Latest appointments</Text>
				{(data?.latestAppointments || []).slice(0, 5).map((a: any) => (
					<View key={a._id} style={styles.row}>
						<Text style={styles.rowMain}>{a.docData?.name || "Doctor"} · {a.userData?.name || "Patient"}</Text>
						<Text style={styles.rowSub}>{a.slotDate} {a.slotTime} {a.cancelled ? "(cancelled)" : ""}</Text>
					</View>
				))}
				{!data?.latestAppointments?.length ? <Text style={styles.rowSub}>No recent appointments.</Text> : null}
			</Card>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	content: { padding: 16, gap: 12 },
	title: { fontSize: 24, fontWeight: "700", color: colors.text },
	subtitle: { fontSize: 13, color: colors.textMuted },
	error: { color: "#b91c1c" },
	grid: { flexDirection: "row", gap: 10 },
	stat: { flex: 1, padding: 14, gap: 4 },
	statLabel: { color: colors.textMuted, fontSize: 12 },
	statValue: { color: colors.text, fontSize: 22, fontWeight: "700" },
	block: { padding: 14, gap: 10 },
	blockTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
	row: { gap: 2, paddingVertical: 4 },
	rowMain: { color: colors.text, fontWeight: "600" },
	rowSub: { color: colors.textMuted, fontSize: 12 },
});
