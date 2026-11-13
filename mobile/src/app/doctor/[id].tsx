import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, EmptyState } from "@/components/ui";
import { ApiError, bookAppointment, getDoctors } from "@/lib/api";
import { buildAvailableDays, DAY_LABELS, type DaySlots, type TimeSlot } from "@/lib/slots";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";
import type { Doctor } from "@/lib/types";

// Screen component for doctor detail in the mobile app.
export default function DoctorDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { token } = useSession();
	const [doctor, setDoctor] = useState<Doctor | null>(null);
	const [loading, setLoading] = useState(true);
	const [dayIndex, setDayIndex] = useState(0);
	const [selected, setSelected] = useState<TimeSlot | null>(null);
	const [booking, setBooking] = useState(false);

	useEffect(() => {
		getDoctors()
			.then((list) => setDoctor(list.find((d) => d._id === id) ?? null))
			.catch((error: unknown) => {
				if (error instanceof ApiError) Alert.alert("Could not load doctor", error.message);
			})
			.finally(() => setLoading(false));
	}, [id]);

	const days = useMemo<DaySlots[]>(() => (doctor ? buildAvailableDays(doctor) : []), [doctor]);
	const currentDay = days[dayIndex];

	// Helper that book.
	const book = async () => {
		if (!doctor || !selected || !currentDay || !token) return;
		setBooking(true);
		try {
			await bookAppointment(token, doctor._id, currentDay.key, selected.time);
			Alert.alert("Appointment booked", `${doctor.name} · ${currentDay.key} ${selected.time}`);
			router.replace("/(tabs)/appointments");
		} catch (error) {
			Alert.alert("Could not book", error instanceof ApiError ? error.message : "Please try again.");
		} finally {
			setBooking(false);
		}
	};

	if (loading) {
		return <ActivityIndicator style={styles.loader} color={colors.primary} />;
	}
	if (!doctor) {
		return <EmptyState title="Doctor not found" body="This doctor may have been removed." />;
	}

	return (
		<ScrollView contentContainerStyle={styles.content}>
			<Card style={styles.profile}>
				<Image source={{ uri: doctor.image }} style={styles.photo} />
				<Text style={styles.name}>{doctor.name}</Text>
				<Text style={styles.meta}>
					{doctor.degree} · {doctor.specialty}
				</Text>
				<View style={styles.pills}>
					<Text style={styles.pill}>{doctor.experience}</Text>
					<Text style={styles.pill}>${doctor.fees} fee</Text>
				</View>
				<Text style={styles.about}>{doctor.about}</Text>
			</Card>

			<Text style={styles.section}>Choose a day</Text>
			{days.length === 0 ? (
				<EmptyState title="Fully booked" body="No open slots in the next week." />
			) : (
				<>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
						{days.map((day, index) => {
							const active = index === dayIndex;
							return (
								<Pressable
									key={day.key}
									accessibilityRole="button"
									accessibilityState={{ selected: active }}
									onPress={() => {
										setDayIndex(index);
										setSelected(null);
									}}
									style={[styles.dayChip, active && styles.dayChipActive]}
								>
									<Text style={[styles.dayName, active && styles.onActive]}>
										{DAY_LABELS[day.date.getDay()]}
									</Text>
									<Text style={[styles.dayNumber, active && styles.onActive]}>{day.date.getDate()}</Text>
								</Pressable>
							);
						})}
					</ScrollView>

					<Text style={styles.section}>Choose a time</Text>
					<View style={styles.slotGrid}>
						{currentDay?.slots.map((slot) => {
							const active = selected?.time === slot.time;
							return (
								<Pressable
									key={slot.time}
									accessibilityRole="button"
									accessibilityState={{ selected: active }}
									onPress={() => setSelected(slot)}
									style={[styles.slot, active && styles.slotActive]}
								>
									<Text style={[styles.slotLabel, active && styles.onActive]}>{slot.time}</Text>
								</Pressable>
							);
						})}
					</View>

					<Button
						label={selected ? `Book ${selected.time}` : "Select a time"}
						disabled={!selected}
						loading={booking}
						onPress={book}
						style={styles.confirm}
					/>
				</>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: { padding: 16, gap: 12, paddingBottom: 40 },
	loader: { marginTop: 48 },
	profile: { alignItems: "center", gap: 6, padding: 20 },
	photo: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primarySoft },
	name: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 8 },
	meta: { fontSize: 14, color: colors.textMuted },
	pills: { flexDirection: "row", gap: 8, marginTop: 4 },
	pill: {
		fontSize: 12,
		color: colors.primary,
		backgroundColor: colors.primarySoft,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	about: { fontSize: 14, lineHeight: 21, color: colors.textMuted, textAlign: "center", marginTop: 8 },
	section: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 8 },
	dayRow: { gap: 8, paddingVertical: 4 },
	dayChip: {
		width: 60,
		paddingVertical: 10,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		backgroundColor: colors.surface,
	},
	dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	dayName: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
	dayNumber: { fontSize: 18, color: colors.text, fontWeight: "700", marginTop: 2 },
	onActive: { color: "#fff" },
	slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	slot: {
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	slotLabel: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
	confirm: { marginTop: 16 },
});
