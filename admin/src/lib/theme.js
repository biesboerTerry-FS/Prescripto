import { useCallback, useState } from "react";

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
export const initTheme = () => {
	const saved = localStorage.getItem(STORAGE_KEY);
	const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
	apply(saved ?? (prefersDark ? "dark" : "light"));
};

// Hook that use theme.
export const useTheme = () => {
	const [theme, setTheme] = useState(current);
	const toggle = useCallback(() => {
		const next = current() === "dark" ? "light" : "dark";
		localStorage.setItem(STORAGE_KEY, next);
		apply(next);
		setTheme(next);
	}, []);
	return { theme, toggle };
};
