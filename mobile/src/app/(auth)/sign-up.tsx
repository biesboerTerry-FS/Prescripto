import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { Button, Card } from "@/components/ui";
import { ApiError, register } from "@/lib/api";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";

// Renders the Sign Up UI.
export default function SignUp() {
	const { signIn } = useSession();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);

	// Helper that on submit.
	const onSubmit = async () => {
		if (!name.trim() || !email.trim() || !password) {
			Alert.alert("Missing details", "Fill in every field to create an account.");
			return;
		}
		if (password.length < 8) {
			Alert.alert("Password too short", "Use at least 8 characters.");
			return;
		}
		setBusy(true);
		try {
			await signIn(await register(name.trim(), email.trim(), password));
		} catch (error) {
			Alert.alert("Could not create account", error instanceof ApiError ? error.message : "Please try again.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
				<Card style={styles.card}>
					<Text style={styles.title}>Create your account</Text>
					<Text style={styles.subtitle}>It takes under a minute.</Text>

					<Text style={styles.label}>Full name</Text>
					<TextInput accessibilityLabel="Full name" value={name} onChangeText={setName} autoComplete="name" style={styles.input} />

					<Text style={styles.label}>Email</Text>
					<TextInput
						accessibilityLabel="Email"
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						autoComplete="email"
						keyboardType="email-address"
						style={styles.input}
					/>

					<Text style={styles.label}>Password</Text>
					<TextInput
						accessibilityLabel="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						autoComplete="new-password"
						placeholder="At least 8 characters"
						style={styles.input}
					/>

					<Button label="Create account" onPress={onSubmit} loading={busy} style={styles.submit} />
				</Card>

				<Text style={styles.footer}>
					Already registered?{" "}
					<Link href="/(auth)/sign-in" style={styles.link}>
						Sign in
					</Link>
				</Text>
				<View />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: colors.background },
	container: { flexGrow: 1, justifyContent: "center", padding: 20, gap: 20 },
	card: { gap: 8, padding: 20 },
	title: { fontSize: 20, fontWeight: "700", color: colors.text },
	subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 6 },
	label: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
	input: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 15,
		backgroundColor: colors.surface,
	},
	submit: { marginTop: 12 },
	footer: { textAlign: "center", color: colors.textMuted, fontSize: 14 },
	link: { color: colors.primary, fontWeight: "600" },
});
