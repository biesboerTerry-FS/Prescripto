import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Button, Card } from "@/components/ui";
import { ApiError, getProfile, updateProfile } from "@/lib/api";
import { clearCachedProfile, readCachedProfile, writeCachedProfile } from "@/lib/profileCache";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/ThemeContext";
import type { ThemeColors } from "@/lib/theme";
import type { Profile } from "@/lib/types";

type FormState = {
	name: string;
	phone: string;
	addressLine1: string;
	gender: string;
	dob: string;
};

// Helper that derives user derives initials from a name for display for an avatar fallback.
function initialsOf(name: string) {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

// Helper that maps the current profile into the editable form fields.
function toForm(profile: Profile | null): FormState {
	return {
		name: profile?.name ?? "",
		phone: profile?.phone && profile.phone !== "Not Selected" ? profile.phone : "",
		addressLine1: profile?.address?.line1 ?? "",
		gender: profile?.gender && profile.gender !== "Not Selected" ? profile.gender : "",
		dob: profile?.dob && profile.dob !== "Not Selected" ? profile.dob : "",
	};
}

// Renders the Row UI.
function Row({ label, value }: { label: string; value?: string }) {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
	return (
		<View style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>
			<Text style={styles.rowValue}>{value && value !== "Not Selected" ? value : "—"}</Text>
		</View>
	);
}

// Screen component for profile in the mobile app.
export default function ProfileScreen() {
	const { theme, dark, toggleTheme } = useTheme();
	const styles = makeStyles(theme);
	const { token, signOut } = useSession();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState<FormState>(() => toForm(null));
	const [status, setStatus] = useState<string | null>(null);

	useFocusEffect(
		useCallback(() => {
			if (!token) return;
			let active = true;
			const cached = readCachedProfile(token);
			getProfile(token)
				.then((data) => {
					if (!active) return;
					// A successful fetch means the API is back: the local demo edit
					// is no longer needed, but show it once so it isn't lost silently.
					clearCachedProfile(token);
					setProfile(cached ? { ...data, ...cached } : data);
				})
				.catch((error: unknown) => {
					if (!active) return;
					if (cached) {
						setProfile(cached);
						return;
					}
					if (error instanceof ApiError) Alert.alert("Could not load profile", error.message);
				})
				.finally(() => {
					if (active) setLoading(false);
				});
			return () => {
				active = false;
			};
		}, [token])
	);

	// Helper that confirm sign out.
	const confirmSignOut = () => {
		Alert.alert("Sign out?", "You'll need to sign in again to book appointments.", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Sign out", style: "destructive", onPress: () => signOut() },
		]);
	};

	const openEditor = () => {
		setForm(toForm(profile));
		setStatus(null);
		setEditing(true);
	};

	const changeField = (field: keyof FormState, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	const saveProfile = async () => {
		if (!token || !profile) return;
		const name = form.name.trim();
		if (!name) {
			setStatus("Please enter your name.");
			return;
		}
		const updated: Profile = {
			...profile,
			name,
			phone: form.phone.trim() || "0000000000",
			address: { line1: form.addressLine1.trim(), line2: profile.address?.line2 ?? "" },
			gender: form.gender.trim() || "Not Selected",
			dob: form.dob.trim() || "Not Selected",
		};
		setSaving(true);
		try {
			await updateProfile(token, {
				name: updated.name,
				phone: updated.phone ?? "0000000000",
				address: {
					line1: updated.address?.line1 ?? "",
					line2: updated.address?.line2 ?? "",
				},
				dob: updated.dob ?? "Not Selected",
				gender: updated.gender ?? "Not Selected",
			});
			clearCachedProfile(token);
			setStatus("Profile updated.");
		} catch {
			// API unreachable: keep the change for this browser session so the
			// edit flow still works in the offline portfolio demo.
			writeCachedProfile(token, updated);
			setStatus("Saved on this device (server unavailable).");
		} finally {
			setProfile(updated);
			setEditing(false);
			setSaving(false);
		}
	};

	if (loading) {
		return <ActivityIndicator style={styles.loader} color={theme.primary} />;
	}

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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

			{status ? <Text style={styles.status}>{status}</Text> : null}

			<Card style={styles.details}>
				<Row label="Phone" value={profile?.phone} />
				<Row label="Address" value={profile?.address?.line1} />
				<Row label="Gender" value={profile?.gender} />
				<Row label="Date of birth" value={profile?.dob} />
				<View style={styles.row}>
					<Text style={styles.rowLabel}>Dark mode</Text>
					<Switch
						value={dark}
						onValueChange={toggleTheme}
						accessibilityLabel="Dark mode"
						trackColor={{ false: theme.border, true: theme.primary }}
						thumbColor={theme.surface}
					/>
				</View>
			</Card>

			{editing ? (
				<Card style={styles.form}>
					<Text style={styles.formTitle}>Edit profile</Text>
					<Text style={styles.label}>Full name</Text>
					<TextInput
						accessibilityLabel="Full name"
						value={form.name}
						onChangeText={(value) => changeField("name", value)}
						placeholder="Your name"
						style={styles.input}
					/>
					<Text style={styles.label}>Phone number</Text>
					<TextInput
						accessibilityLabel="Phone number"
						value={form.phone}
						onChangeText={(value) => changeField("phone", value)}
						placeholder="Phone number"
						keyboardType="phone-pad"
						style={styles.input}
					/>
					<Text style={styles.label}>Address</Text>
					<TextInput
						accessibilityLabel="Address line 1"
						value={form.addressLine1}
						onChangeText={(value) => changeField("addressLine1", value)}
						placeholder="Street address"
						style={styles.input}
					/>
					<Text style={styles.label}>Gender</Text>
					<TextInput
						accessibilityLabel="Gender"
						value={form.gender}
						onChangeText={(value) => changeField("gender", value)}
						placeholder="Gender"
						style={styles.input}
					/>
					<Text style={styles.label}>Date of birth</Text>
					<TextInput
						accessibilityLabel="Date of birth"
						value={form.dob}
						onChangeText={(value) => changeField("dob", value)}
						placeholder="YYYY-MM-DD"
						style={styles.input}
					/>
					<View style={styles.actions}>
						<Button label="Save changes" loading={saving} onPress={saveProfile} />
						<Button
							label="Cancel"
							variant="outline"
							disabled={saving}
							onPress={() => {
								setEditing(false);
								setStatus(null);
							}}
						/>
					</View>
				</Card>
			) : (
				<Button label="Edit profile" variant="outline" onPress={openEditor} />
			)}

			<Button label="Sign out" variant="outline" onPress={confirmSignOut} />
		</ScrollView>
	);
}

const makeStyles = (theme: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: theme.background },
		content: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: theme.background },
		loader: { marginTop: 48 },
		hero: { alignItems: "center", gap: 6, paddingVertical: 24 },
		avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.primarySoft },
		avatarFallback: { alignItems: "center", justifyContent: "center" },
		avatarText: { fontSize: 28, fontWeight: "700", color: theme.primary },
		name: { fontSize: 20, fontWeight: "700", color: theme.text, marginTop: 8 },
		email: { fontSize: 14, color: theme.textMuted },
		status: { fontSize: 14, color: theme.primary, textAlign: "center" },
		details: { gap: 14 },
		row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
		rowLabel: { fontSize: 14, color: theme.textMuted },
		rowValue: { fontSize: 14, color: theme.text, fontWeight: "500" },
		form: { gap: 6 },
		formTitle: { fontSize: 17, fontWeight: "700", color: theme.text, marginBottom: 8 },
		label: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
		input: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 10,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 15,
			backgroundColor: theme.surface,
			color: theme.text,
		},
		actions: { flexDirection: "row", gap: 10, marginTop: 14 },
	});
