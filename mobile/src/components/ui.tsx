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
import { useTheme } from "@/lib/ThemeContext";
import type { ThemeColors } from "@/lib/theme";

type ButtonProps = Omit<PressableProps, "style"> & {
	label: string;
	variant?: "primary" | "outline" | "danger";
	loading?: boolean;
	style?: ViewStyle;
};

// Theme-aware styles for the shared UI primitives.
const makeStyles = (theme: ThemeColors) =>
	StyleSheet.create({
		button: {
			minHeight: 48,
			borderRadius: 999,
			alignItems: "center",
			justifyContent: "center",
			paddingHorizontal: 24,
		},
		buttonPrimary: { backgroundColor: theme.primary },
		buttonOutline: { borderWidth: 1, borderColor: theme.primary, backgroundColor: theme.surface },
		buttonDanger: { borderWidth: 1, borderColor: theme.dangerSoft, backgroundColor: theme.surface },
		buttonLabel: { fontSize: 15, fontWeight: "600", color: theme.onPrimary },
		buttonOutlineLabel: { color: theme.primary },
		buttonDangerLabel: { color: theme.danger },
		card: {
			backgroundColor: theme.surface,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: theme.border,
			padding: 16,
		},
		badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
		badgeLabel: { fontSize: 12, fontWeight: "600" },
		empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 6 },
		emptyTitle: { fontSize: 16, fontWeight: "600", color: theme.text },
		emptyBody: { fontSize: 14, color: theme.textMuted, textAlign: "center" },
	});

// Renders the Button UI.
export function Button({ label, variant = "primary", loading = false, disabled, style, ...rest }: ButtonProps) {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
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
				<ActivityIndicator color={variant === "outline" ? theme.primary : theme.onPrimary} />
			) : (
				<Text
					style={[
						styles.buttonLabel,
						variant === "outline" && styles.buttonOutlineLabel,
						variant === "danger" && styles.buttonDangerLabel,
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
	const { theme } = useTheme();
	return <View style={[makeStyles(theme).card, style]}>{children}</View>;
}

// Renders the Badge UI.
export function Badge({ label, tone }: { label: string; tone: "teal" | "amber" | "red" | "slate" }) {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
	const palette = {
		teal: { bg: theme.primarySoft, fg: theme.primary },
		amber: { bg: theme.amberSoft, fg: theme.amber },
		red: { bg: theme.dangerSoft, fg: theme.danger },
		slate: { bg: theme.background, fg: theme.textMuted },
	}[tone];
	return (
		<View style={[styles.badge, { backgroundColor: palette.bg }]}>
			<Text style={[styles.badgeLabel, { color: palette.fg }]}>{label}</Text>
		</View>
	);
}

// Renders the Empty State UI.
export function EmptyState({ title, body }: { title: string; body: string }) {
	const { theme } = useTheme();
	const styles = makeStyles(theme);
	return (
		<View style={styles.empty}>
			<Text style={styles.emptyTitle}>{title}</Text>
			<Text style={styles.emptyBody}>{body}</Text>
		</View>
	);
}
