import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { DoctorCard } from "@/components/DoctorCard";
import { SpecialtyChips } from "@/components/SpecialtyChips";
import { EmptyState } from "@/components/ui";
import { getDoctors } from "@/lib/api";
import { colors, SPECIALTIES } from "@/lib/theme";
import type { Doctor } from "@/lib/types";

// Screen component for doctors in the mobile app.
export default function DoctorsScreen() {
	const params = useLocalSearchParams<{ specialty?: string }>();
	const [selected, setSelected] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Home screen links arrive as ?specialty=...; keep the chip in sync with them.
	const incoming = params.specialty && (SPECIALTIES as readonly string[]).includes(params.specialty)
		? params.specialty
		: null;

	useFocusEffect(
		useCallback(() => {
			if (incoming !== null) setSelected(incoming);
			setLoading(true);
			getDoctors()
				.then((list) => {
					setDoctors(list);
					setError(null);
				})
				.catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load doctors."))
				.finally(() => setLoading(false));
		}, [incoming])
	);

	const visible = useMemo(() => {
		const term = query.trim().toLowerCase();
		return doctors.filter(
			(d) =>
				(!selected || d.specialty === selected) &&
				(!term || d.name.toLowerCase().includes(term) || d.specialty.toLowerCase().includes(term))
		);
	}, [doctors, selected, query]);

	return (
		<FlatList
			data={visible}
			keyExtractor={(item) => item._id}
			numColumns={2}
			contentContainerStyle={styles.content}
			columnWrapperStyle={styles.column}
			ListHeaderComponent={
				<View style={styles.header}>
					<Text style={styles.heading}>Browse by specialty</Text>
					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search by name or specialty"
						accessibilityLabel="Search doctors"
						autoCorrect={false}
						clearButtonMode="while-editing"
						style={styles.search}
					/>
					<View style={styles.chipsWrap}>
						<SpecialtyChips selected={selected} onSelect={setSelected} />
					</View>
				</View>
			}
			ListEmptyComponent={
				loading ? (
					<ActivityIndicator style={styles.loader} color={colors.primary} />
				) : (
					<EmptyState
						title={error ? "Can't load doctors" : "No doctors in this specialty"}
						body={error ?? "Try another specialty, or check back soon."}
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
	header: { gap: 10, marginBottom: 8, paddingHorizontal: 6 },
	heading: { fontSize: 20, fontWeight: "700", color: colors.text },
	search: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 999,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 15,
		backgroundColor: colors.surface,
		color: colors.text,
	},
	chipsWrap: { marginHorizontal: -16 },
	loader: { marginTop: 48 },
});
