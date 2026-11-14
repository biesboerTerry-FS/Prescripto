/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#0f766e",
				"primary-dark": "#115e59",
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-system", "system-ui", "sans-serif"],
			},
			gridTemplateColumns: {
				auto: "repeat(auto-fill, minmax(165px, 1fr))",
			},
		},
	},
	plugins: [],
};
