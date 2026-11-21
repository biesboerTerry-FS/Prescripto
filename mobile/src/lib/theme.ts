// Light palette (the original Prescripto theme).
export const colors = {
	primary: "#0f766e",
	primaryDark: "#115e59",
	primarySoft: "#f0fdfa",
	primaryRing: "#99f6e4",
	onPrimary: "#ffffff",
	background: "#f8fafc",
	surface: "#ffffff",
	border: "#e2e8f0",
	text: "#1e293b",
	textMuted: "#64748b",
	danger: "#dc2626",
	dangerSoft: "#fef2f2",
	amber: "#b45309",
	amberSoft: "#fffbeb",
} as const;

// Dark palette: navy surfaces, light text, and a lighter teal accent so it
// stays legible against the dark background. Keys match `colors` exactly.
export const darkColors = {
	primary: "#2dd4bf",
	primaryDark: "#5eead4",
	primarySoft: "#123332",
	primaryRing: "#115e59",
	onPrimary: "#0b1220",
	background: "#0b1220",
	surface: "#111a2e",
	border: "#233248",
	text: "#e2e8f0",
	textMuted: "#94a3b8",
	danger: "#f87171",
	dangerSoft: "#3b1414",
	amber: "#fbbf24",
	amberSoft: "#3a2a0b",
} as const;

export type ThemeColors = typeof colors | typeof darkColors;

export const SPECIALTIES = [
	"General Physician",
	"Gynecologist",
	"Dermatologist",
	"Pediatrician",
	"Neurologist",
	"Gastroenterologist",
] as const;
