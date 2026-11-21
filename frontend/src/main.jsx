import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import "./index.css";
import { initTheme } from "./lib/theme";

initTheme();
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/AppContext.jsx";

// Patient/public authentication is handled by Clerk. Admin and doctor portals
// are separate apps and keep their own custom authentication.
const publishableKey =
	import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
	import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
	<ClerkProvider
		publishableKey={publishableKey}
		signInFallbackRedirectUrl="/"
		signUpFallbackRedirectUrl="/"
	>
		<BrowserRouter>
			<AppContextProvider>
				<App />
			</AppContextProvider>
		</BrowserRouter>
	</ClerkProvider>
);
