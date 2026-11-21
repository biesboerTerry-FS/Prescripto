import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { ThemeColors } from "@/lib/theme";
import type { Doctor } from "@/lib/types";

type Props = {
	doctor: Doctor;
	onPress: () => void;
};

const makeStyles = (theme: ThemeColors) =>
	StyleSheet.create({
		card: {
			flex: 1,
			margin: 6,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: theme.primaryRing,
			backgroundColor: theme.surface,
			overflow: "hidden",
			shadowColor: "#0f172a",
			shadowOpacity: 0.06,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 2 },
			elevation: 2,
		},
		image: { width: "100%", aspectRatio: 1, backgroundColor: theme.primarySoft },
		body: { padding: 12, gap: 2 },
		availability: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
		dot: { width: 8, height: 8, borderRadius: 4 },
		availabilityLabel: { fontSize: 12, color: theme.textMuted },
		name: { fontSize: 15, fontWeight: "600", color: theme.text },
		specialty: { fontSize: 13, color: theme.textMuted },
		fee: { fontSize: 13, color: theme.primary, fontWeight: "600", marginTop: 4 },
	});

// Renders the Doctor Card UI.
export function DoctorCard({ doctor, onPress }: Props) {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${doctor.name}, ${doctor.specialty}`}
			onPress={onPress}
			style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
		>
			<Image source={{ uri: doctor.image }} style={styles.image} />
			<View style={styles.body}>
				<View style={styles.availability}>
					<View style={[styles.dot, { backgroundColor: doctor.available ? "#22c55e" : "#94a3b8" }]} />
					<Text style={styles.availabilityLabel}>{doctor.available ? "Available" : "Unavailable"}</Text>
				</View>
				<Text style={styles.name} numberOfLines={1}>
					{doctor.name}
				</Text>
				<Text style={styles.specialty} numberOfLines={1}>
					{doctor.specialty}
				</Text>
				<Text style={styles.fee}>${doctor.fees} consultation</Text>
			</View>
		</Pressable>
	);
}
