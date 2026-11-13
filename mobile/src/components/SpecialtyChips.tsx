import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors, SPECIALTIES } from "@/lib/theme";

type Props = {
	selected: string | null;
	onSelect: (specialty: string | null) => void;
	showAll?: boolean;
};

// Renders the Specialty Chips UI.
export function SpecialtyChips({ selected, onSelect, showAll = true }: Props) {
	const items: (string | null)[] = showAll ? [null, ...SPECIALTIES] : [...SPECIALTIES];
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
			{items.map((item) => {
				const active = item === selected;
				return (
					<Pressable
						key={item ?? "all"}
						accessibilityRole="button"
						accessibilityState={{ selected: active }}
						onPress={() => onSelect(item)}
						style={[styles.chip, active && styles.chipActive]}
					>
						<Text style={[styles.label, active && styles.labelActive]}>{item ?? "All"}</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	row: { gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	label: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
	labelActive: { color: "#fff" },
});
