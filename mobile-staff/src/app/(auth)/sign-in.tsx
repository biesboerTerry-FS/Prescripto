import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card } from "@/components/ui";
import { ApiError, adminLogin } from "@/lib/api";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";

export default function StaffSignIn() {
	const { signIn } = useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);

	const onSubmit = async () => {
		if (!email.trim() || !password) {
			Alert.alert("Missing details", "Enter admin email and password.");
			return;
		}
		setBusy(true);
		try {
			const token = await adminLogin(email.trim(), password);
			await signIn(token);
		} catch (error) {
			Alert.alert("Sign in failed", error instanceof ApiError ? error.message : "Please try again.");
		} finally {
			setBusy(false);
		}
	};

	const onDemoAdmin = async () => {
		setBusy(true);
		try {
			const token = await adminLogin("demo-admin@prescripto.com", "DemoAdmin123!");
			await signIn(token);
		} catch (error) {
			Alert.alert("Demo sign in failed", error instanceof ApiError ? error.message : "Please try again.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
				<View style={styles.brand}>
					<Text style={styles.logo}>Prescripto Staff</Text>
					<Text style={styles.tagline}>Admin and doctor mobile access</Text>
				</View>

				<Card style={styles.card}>
					<Text style={styles.title}>Admin sign in</Text>
					<Text style={styles.note}>
						Doctor login is not available yet because doctor auth APIs are not implemented. Use admin credentials for
						staff management.
					</Text>

					<Text style={styles.label}>Email</Text>
					<TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="admin@email.com" style={styles.input} />

					<Text style={styles.label}>Password</Text>
					<TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Password" style={styles.input} />

					<Button label="Sign in as admin" onPress={onSubmit} loading={busy} style={styles.submit} />
					<Button label="Sign in as demo admin" variant="outline" disabled={busy} onPress={onDemoAdmin} />
				</Card>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: colors.background },
	container: { flexGrow: 1, justifyContent: "center", padding: 20, gap: 20 },
	brand: { alignItems: "center", gap: 6 },
	logo: { fontSize: 30, fontWeight: "700", color: colors.primary },
	tagline: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
	card: { gap: 8, padding: 20 },
	title: { fontSize: 20, fontWeight: "700", color: colors.text },
	note: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
	label: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
	input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: colors.surface },
	submit: { marginTop: 12 },
});
