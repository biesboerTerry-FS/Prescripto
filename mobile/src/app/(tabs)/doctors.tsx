import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SpecialtyChips } from "@/components/SpecialtyChips";
import { EmptyState } from "@/components/ui";
import { getDoctors } from "@/lib/api";
import { useTheme } from "@/lib/ThemeContext";
import { SPECIALTIES, type ThemeColors } from "@/lib/theme";
import type { Doctor } from "@/lib/types";

// Screen component for doctors in the mobile app.
export default function DoctorsScreen() {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
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
			style={styles.list}
			contentContainerStyle={styles.content}
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
					<ActivityIndicator style={styles.loader} color={theme.primary} />
				) : (
					<EmptyState
						title={error ? "Can't load doctors" : "No doctors in this specialty"}
						body={error ?? "Try another specialty, or check back soon."}
					/>
				)
			}
			renderItem={({ item }) => (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`${item.name}, ${item.specialty}`}
					onPress={() => router.push(`/doctor/${item._id}`)}
					style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
				>
					<Image source={{ uri: item.image }} style={styles.image} />
					<View style={styles.info}>
						<Text style={styles.name} numberOfLines={1}>
							{item.name}
						</Text>
						<Text style={styles.specialty} numberOfLines={1}>
							{item.specialty}
						</Text>
						<Text style={styles.meta} numberOfLines={1}>
							${item.fees} consultation{item.experience ? ` · ${item.experience} experience` : ""}
						</Text>
					</View>
				</Pressable>
			)}
		/>
	);
}

const makeStyles = (theme: ThemeColors) =>
	StyleSheet.create({
		list: { flex: 1, backgroundColor: theme.background },
		content: { padding: 10, paddingBottom: 32, flexGrow: 1, backgroundColor: theme.background },
		header: { gap: 10, marginBottom: 12, paddingHorizontal: 6 },
		heading: { fontSize: 20, fontWeight: "700", color: theme.text },
		search: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 999,
			paddingHorizontal: 16,
			paddingVertical: 12,
			fontSize: 15,
			backgroundColor: theme.surface,
			color: theme.text,
		},
		chipsWrap: { marginHorizontal: -16 },
		row: {
			flexDirection: "row",
			alignItems: "center",
			gap: 14,
			padding: 10,
			marginVertical: 4,
			borderRadius: 14,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.surface,
		},
		rowPressed: { opacity: 0.75 },
		image: { width: 64, height: 64, borderRadius: 12, backgroundColor: theme.primarySoft },
		info: { flex: 1, gap: 2 },
		name: { fontSize: 16, fontWeight: "600", color: theme.text },
		specialty: { fontSize: 13, color: theme.textMuted },
		meta: { fontSize: 12, color: theme.primary, marginTop: 2 },
		loader: { marginTop: 48 },
	});
