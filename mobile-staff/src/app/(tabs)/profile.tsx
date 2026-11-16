import { StyleSheet, Text, View } from "react-native";
import { Button, Card } from "@/components/ui";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";

export default function AccountScreen() {
	const { signOut } = useSession();
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Account</Text>
			<Card style={styles.card}>
				<Text style={styles.heading}>Staff mobile app</Text>
				<Text style={styles.body}>Admin management is enabled using existing admin authentication and APIs. Doctor-specific login and workflows are not yet implemented in the backend, so this app currently supports admin operations and can be extended for doctors when those endpoints exist.</Text>
				<Button label="Sign out" onPress={() => void signOut()} style={{ marginTop: 12 }} />
			</Card>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 12 },
	title: { fontSize: 24, fontWeight: "700", color: colors.text },
	card: { padding: 16, gap: 8 },
	heading: { fontSize: 16, fontWeight: "700", color: colors.text },
	body: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
