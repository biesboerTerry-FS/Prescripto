import type { ReactNode } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
	type PressableProps,
	type ViewStyle,
} from "react-native";
import { colors } from "@/lib/theme";

type ButtonProps = Omit<PressableProps, "style"> & {
	label: string;
	variant?: "primary" | "outline" | "danger";
	loading?: boolean;
	style?: ViewStyle;
};

// Renders the Button UI.
export function Button({ label, variant = "primary", loading = false, disabled, style, ...rest }: ButtonProps) {
	const isDisabled = disabled || loading;
	return (
		<Pressable
			accessibilityRole="button"
			disabled={isDisabled}
			style={({ pressed }) => [
				styles.button,
				variant === "primary" && styles.buttonPrimary,
				variant === "outline" && styles.buttonOutline,
				variant === "danger" && styles.buttonDanger,
				pressed && !isDisabled && { opacity: 0.85 },
				isDisabled && { opacity: 0.5 },
				style,
			]}
			{...rest}
		>
			{loading ? (
				<ActivityIndicator color={variant === "outline" ? colors.primary : "#fff"} />
			) : (
				<Text
					style={[
						styles.buttonLabel,
						variant === "outline" && { color: colors.primary },
						variant === "danger" && { color: colors.danger },
					]}
				>
					{label}
				</Text>
			)}
		</Pressable>
	);
}

// Renders the Card UI.
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	return <View style={[styles.card, style]}>{children}</View>;
}

// Renders the Badge UI.
export function Badge({ label, tone }: { label: string; tone: "teal" | "amber" | "red" | "slate" }) {
	const palette = {
		teal: { bg: colors.primarySoft, fg: colors.primary },
		amber: { bg: colors.amberSoft, fg: colors.amber },
		red: { bg: colors.dangerSoft, fg: colors.danger },
		slate: { bg: "#f1f5f9", fg: colors.textMuted },
	}[tone];
	return (
		<View style={[styles.badge, { backgroundColor: palette.bg }]}>
			<Text style={[styles.badgeLabel, { color: palette.fg }]}>{label}</Text>
		</View>
	);
}

// Renders the Empty State UI.
export function EmptyState({ title, body }: { title: string; body: string }) {
	return (
		<View style={styles.empty}>
			<Text style={styles.emptyTitle}>{title}</Text>
			<Text style={styles.emptyBody}>{body}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: 48,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	buttonPrimary: { backgroundColor: colors.primary },
	buttonOutline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
	buttonDanger: { borderWidth: 1, borderColor: "#fecaca", backgroundColor: colors.surface },
	buttonLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
	card: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
	},
	badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
	badgeLabel: { fontSize: 12, fontWeight: "600" },
	empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 6 },
	emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
	emptyBody: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
});
