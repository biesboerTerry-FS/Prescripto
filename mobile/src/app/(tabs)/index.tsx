import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { DoctorCard } from "@/components/DoctorCard";
import { SpecialtyChips } from "@/components/SpecialtyChips";
import { EmptyState } from "@/components/ui";
import { getDoctors } from "@/lib/api";
import { colors } from "@/lib/theme";
import type { Doctor } from "@/lib/types";

// Screen component for home in the mobile app.
export default function HomeScreen() {
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setError(null);
			setDoctors(await getDoctors());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not load doctors.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);

	// Helper that open specialty.
	const openSpecialty = (specialty: string | null) => {
		router.navigate({ pathname: "/doctors", params: specialty ? { specialty } : {} });
	};

	return (
		<FlatList
			data={doctors.slice(0, 10)}
			keyExtractor={(item) => item._id}
			numColumns={2}
			contentContainerStyle={styles.content}
			columnWrapperStyle={styles.column}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => {
						setRefreshing(true);
						load();
					}}
					tintColor={colors.primary}
				/>
			}
			ListHeaderComponent={
				<View style={styles.header}>
					<Text style={styles.greeting}>Find a doctor</Text>
					<Text style={styles.subtitle}>Browse by specialty or pick a top-rated doctor below.</Text>
					<View style={styles.chipsWrap}>
						<SpecialtyChips selected={null} onSelect={openSpecialty} />
					</View>
					<Text style={styles.sectionTitle}>Top doctors</Text>
				</View>
			}
			ListEmptyComponent={
				loading ? (
					<ActivityIndicator style={styles.loader} color={colors.primary} />
				) : (
					<EmptyState
						title={error ? "Can't load doctors" : "No doctors yet"}
						body={error ?? "Doctors will appear here once the clinic adds them."}
					/>
				)
			}
			renderItem={({ item }) => (
				<DoctorCard doctor={item} onPress={() => router.push(`/doctor/${item._id}`)} />
			)}
		/>
	);
}

const styles = StyleSheet.create({
	content: { padding: 10, paddingBottom: 32, flexGrow: 1 },
	column: { paddingHorizontal: 6 },
	header: { paddingHorizontal: 6, gap: 6, marginBottom: 8 },
	greeting: { fontSize: 26, fontWeight: "700", color: colors.text },
	subtitle: { fontSize: 14, color: colors.textMuted },
	chipsWrap: { marginHorizontal: -16, marginTop: 10 },
	sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 14 },
	loader: { marginTop: 48 },
});
