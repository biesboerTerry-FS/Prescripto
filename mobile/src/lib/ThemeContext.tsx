import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import { getStoredValue, setStoredValue } from "@/lib/tokenStorage";
import { colors, darkColors, type ThemeColors } from "@/lib/theme";

type ThemeMode = "light" | "dark";

type ThemeValue = {
	dark: boolean;
	theme: ThemeColors;
	toggleTheme: () => void;
};

const THEME_KEY = "prescripto.theme";
const ThemeContext = createContext<ThemeValue | null>(null);

// Provides the active palette and a persisted light/dark toggle to the app.
export function ThemeProvider({ children }: PropsWithChildren) {
	const systemScheme = useColorScheme();
	const [mode, setMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");

	// A saved user choice wins over the OS preference.
	useEffect(() => {
		getStoredValue(THEME_KEY)
			.then((saved) => {
				if (saved === "light" || saved === "dark") setMode(saved);
			})
			.catch(() => {
				// Fall back to the system preference when storage is unavailable.
			});
	}, []);

	const toggleTheme = useCallback(() => {
		setMode((current) => {
			const next = current === "dark" ? "light" : "dark";
			setStoredValue(THEME_KEY, next).catch(() => {});
			return next;
		});
	}, []);

	const value = useMemo<ThemeValue>(() => {
		const dark = mode === "dark";
		return { dark, theme: dark ? darkColors : colors, toggleTheme };
	}, [mode, toggleTheme]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook that exposes the current theme.
export function useTheme() {
	const value = use(ThemeContext);
	if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
	return value;
}
