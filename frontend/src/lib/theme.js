import { useCallback, useEffect, useState } from "react";
import { hasPreferencesConsent, onConsentChange } from "./consent";

const STORAGE_KEY = "prescripto-theme";

// Helper that current.
const current = () =>
	document.documentElement.classList.contains("dark") ? "dark" : "light";

// Helper that apply.
const apply = (theme) => {
	document.documentElement.classList.toggle("dark", theme === "dark");
	document.documentElement.style.colorScheme = theme;
};

// Runs before React renders so the page never flashes the wrong theme.
// Only reads persisted preference when cookie/preferences consent allows it.
export const initTheme = () => {
	const canPersist = hasPreferencesConsent();
	let saved = null;
	try {
		if (canPersist) saved = localStorage.getItem(STORAGE_KEY);
	} catch {
		saved = null;
	}
	const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
	apply(saved ?? (prefersDark ? "dark" : "light"));
};

// Hook that use theme.
export const useTheme = () => {
	const [theme, setTheme] = useState(current);

	useEffect(() => {
		// If user revokes preference consent, stop persisting theme.
		return onConsentChange((consent) => {
			if (!consent?.preferences) {
				try {
					localStorage.removeItem(STORAGE_KEY);
				} catch {
					// ignore
				}
			} else {
				// Persist current theme once preferences are allowed.
				try {
					localStorage.setItem(STORAGE_KEY, current());
				} catch {
					// ignore
				}
			}
		});
	}, []);

	const toggle = useCallback(() => {
		const next = current() === "dark" ? "light" : "dark";
		apply(next);
		if (hasPreferencesConsent()) {
			try {
				localStorage.setItem(STORAGE_KEY, next);
			} catch {
				// ignore
			}
		}
		setTheme(next);
	}, []);

	return { theme, toggle };
};
