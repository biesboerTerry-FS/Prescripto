import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { Button, Card } from "@/components/ui";
import { ApiError, login, signInWithGoogle, signInWithGoogleDemo } from "@/lib/api";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";
import { useGoogleSignIn } from "@/lib/useGoogleSignIn";

const clerkEnabled = Boolean(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Renders the Sign In UI.
export default function SignIn() {
	const { signIn } = useSession();
	const clerkSignIn = clerkEnabled ? useSignIn() : null;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);

	// Helper that show error.
	const showError = (error: unknown) => {
		Alert.alert("Sign in failed", error instanceof ApiError ? error.message : "Please try again.");
	};

	// Helper that on google token.
	const onGoogleToken = async (idToken: string) => {
		setBusy(true);
		try {
			await signIn(await signInWithGoogle(idToken));
		} catch (error) {
			showError(error);
		} finally {
			setBusy(false);
		}
	};

	// Signs in with the demo patient account for portfolio visitors.
	const onDemoPatient = async () => {
		setBusy(true);
		try {
			await signIn(await login("demo@prescripto.com", "Demo123456"));
		} catch (error) {
			showError(error);
		} finally {
			setBusy(false);
		}
	};

	// Signs in with the shared demo Google account for previewing the flow.
	const onDemoGoogle = async () => {
		setBusy(true);
		try {
			await signIn(await signInWithGoogleDemo());
		} catch (error) {
			showError(error);
		} finally {
			setBusy(false);
		}
	};

	const google = useGoogleSignIn(onGoogleToken, (message) => Alert.alert("Google sign-in", message));

	// Helper that on submit.
	const onSubmit = async () => {
		if (!email.trim() || !password) {
			Alert.alert("Missing details", "Enter your email and password.");
			return;
		}
		setBusy(true);
		try {
			if (clerkEnabled && clerkSignIn?.signIn && clerkSignIn?.setActive) {
				const attempt = await clerkSignIn.signIn.create({
					identifier: email.trim(),
					password,
				});
				if (attempt.status === "complete" && attempt.createdSessionId) {
					await clerkSignIn.setActive({ session: attempt.createdSessionId });
					// ClerkSessionBridge will exchange the Clerk session for a backend JWT.
				} else {
					Alert.alert("Sign in", "Additional verification is required in Clerk for this account.");
				}
			} else {
				await signIn(await login(email.trim(), password));
			}
		} catch (error: any) {
			const clerkMessage = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
			if (clerkEnabled && clerkMessage) {
				Alert.alert("Sign in failed", clerkMessage);
			} else {
				showError(error);
			}
		} finally {
			setBusy(false);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
				<View style={styles.brand}>
					<Text style={styles.logo}>Prescripto</Text>
					<Text style={styles.tagline}>Book trusted doctors in minutes.</Text>
				</View>

				<Card style={styles.card}>
					<Text style={styles.title}>Sign in</Text>

					<Text style={styles.label}>Email</Text>
					<TextInput
						accessibilityLabel="Email"
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						autoComplete="email"
						keyboardType="email-address"
						placeholder="you@email.com"
						style={styles.input}
					/>

					<Text style={styles.label}>Password</Text>
					<TextInput
						accessibilityLabel="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						autoComplete="password"
						placeholder="Your password"
						style={styles.input}
					/>

					<Button label="Sign in" onPress={onSubmit} loading={busy} style={styles.submit} />
					<Button label="Sign in as demo patient" variant="outline" disabled={busy} onPress={onDemoPatient} />
					{clerkEnabled ? (
						<Text style={styles.demoNote}>
							Clerk patient sign-in is enabled. After sign-in, your session is linked to Prescripto automatically.
						</Text>
					) : null}

					<View style={styles.divider}>
						<View style={styles.rule} />
						<Text style={styles.dividerText}>or</Text>
						<View style={styles.rule} />
					</View>
					{google.enabled ? (
						<Button
							label="Continue with Google"
							variant="outline"
							disabled={!google.ready || busy}
							onPress={() => google.promptAsync()}
						/>
					) : (
						<>
							<Button
								label="Continue with Google (demo)"
								variant="outline"
								disabled={busy}
								onPress={onDemoGoogle}
							/>
							<Text style={styles.demoNote}>
								Real Google sign-in isn’t configured, so this uses a shared demo account.
							</Text>
						</>
					)}
				</Card>

				<Text style={styles.footer}>
					New here?{" "}
					<Link href="/(auth)/sign-up" style={styles.link}>
						Create an account
					</Link>
				</Text>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: colors.background },
	container: { flexGrow: 1, justifyContent: "center", padding: 20, gap: 20 },
	brand: { alignItems: "center", gap: 6 },
	logo: { fontSize: 30, fontWeight: "700", color: colors.primary },
	tagline: { fontSize: 14, color: colors.textMuted },
	card: { gap: 8, padding: 20 },
	title: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 4 },
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
	divider: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10 },
	rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
	dividerText: { fontSize: 12, color: colors.textMuted },
	footer: { textAlign: "center", color: colors.textMuted, fontSize: 14 },
	link: { color: colors.primary, fontWeight: "600" },
	demoNote: { textAlign: "center", color: colors.textMuted, fontSize: 12, marginTop: 8 },
});
