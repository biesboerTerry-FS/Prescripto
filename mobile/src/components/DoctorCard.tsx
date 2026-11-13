import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";
import type { Doctor } from "@/lib/types";

type Props = {
	doctor: Doctor;
	onPress: () => void;
};

// Renders the Doctor Card UI.
export function DoctorCard({ doctor, onPress }: Props) {
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

const styles = StyleSheet.create({
	card: {
		flex: 1,
		margin: 6,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#ccfbf1",
		backgroundColor: colors.surface,
		overflow: "hidden",
		shadowColor: "#0f172a",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	image: { width: "100%", aspectRatio: 1, backgroundColor: colors.primarySoft },
	body: { padding: 12, gap: 2 },
	availability: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
	dot: { width: 8, height: 8, borderRadius: 4 },
	availabilityLabel: { fontSize: 12, color: colors.textMuted },
	name: { fontSize: 15, fontWeight: "600", color: colors.text },
	specialty: { fontSize: 13, color: colors.textMuted },
	fee: { fontSize: 13, color: colors.primary, fontWeight: "600", marginTop: 4 },
});
