import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import { SPECIALTIES, type ThemeColors } from "@/lib/theme";

type Props = {
	selected: string | null;
	onSelect: (specialty: string | null) => void;
	showAll?: boolean;
};

const makeStyles = (theme: ThemeColors) =>
	StyleSheet.create({
		row: { gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
		chip: {
			paddingHorizontal: 14,
			paddingVertical: 8,
			borderRadius: 999,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.surface,
		},
		chipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
		label: { fontSize: 13, color: theme.textMuted, fontWeight: "500" },
		labelActive: { color: theme.onPrimary },
	});

// Renders the Specialty Chips UI.
export function SpecialtyChips({ selected, onSelect, showAll = true }: Props) {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
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
