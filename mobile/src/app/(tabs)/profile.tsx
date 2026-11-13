import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Button, Card } from "@/components/ui";
import { ApiError, getProfile } from "@/lib/api";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";
import type { Profile } from "@/lib/types";

// Helper that derives user derives initials from a name for display for an avatar fallback.
function initialsOf(name: string) {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

// Renders the Row UI.
function Row({ label, value }: { label: string; value?: string }) {
	return (
		<View style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>
			<Text style={styles.rowValue}>{value && value !== "Not Selected" ? value : "—"}</Text>
		</View>
	);
}

// Screen component for profile in the mobile app.
export default function ProfileScreen() {
	const { token, signOut } = useSession();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			if (!token) return;
			getProfile(token)
				.then(setProfile)
				.catch((error: unknown) => {
					if (error instanceof ApiError) Alert.alert("Could not load profile", error.message);
				})
				.finally(() => setLoading(false));
		}, [token])
	);

	// Helper that confirm sign out.
	const confirmSignOut = () => {
		Alert.alert("Sign out?", "You'll need to sign in again to book appointments.", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Sign out", style: "destructive", onPress: () => signOut() },
		]);
	};

	if (loading) {
		return <ActivityIndicator style={styles.loader} color={colors.primary} />;
	}

	return (
		<ScrollView contentContainerStyle={styles.content}>
			<Card style={styles.hero}>
				{profile?.image && profile.image !== "Not Selected" ? (
					<Image source={{ uri: profile.image }} style={styles.avatar} />
				) : (
					<View style={[styles.avatar, styles.avatarFallback]}>
						<Text style={styles.avatarText}>{initialsOf(profile?.name ?? "P")}</Text>
					</View>
				)}
				<Text style={styles.name}>{profile?.name ?? "Patient"}</Text>
				<Text style={styles.email}>{profile?.email}</Text>
			</Card>

			<Card style={styles.details}>
				<Row label="Phone" value={profile?.phone} />
				<Row label="Gender" value={profile?.gender} />
				<Row label="Date of birth" value={profile?.dob} />
			</Card>

			<Button label="Sign out" variant="outline" onPress={confirmSignOut} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: { padding: 16, gap: 16, paddingBottom: 32 },
	loader: { marginTop: 48 },
	hero: { alignItems: "center", gap: 6, paddingVertical: 24 },
	avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primarySoft },
	avatarFallback: { alignItems: "center", justifyContent: "center" },
	avatarText: { fontSize: 28, fontWeight: "700", color: colors.primary },
	name: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 8 },
	email: { fontSize: 14, color: colors.textMuted },
	details: { gap: 14 },
	row: { flexDirection: "row", justifyContent: "space-between" },
	rowLabel: { fontSize: 14, color: colors.textMuted },
	rowValue: { fontSize: 14, color: colors.text, fontWeight: "500" },
});
