import { createRoot } from "react-dom/client";
import "./index.css";
import { initTheme } from "./lib/theme";

initTheme();
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import AppContextProvider from "./context/AppContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const appTree = (
	<BrowserRouter>
		<AppContextProvider>
			<App />
		</AppContextProvider>
	</BrowserRouter>
);

const withGoogle = googleClientId ? (
	<GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>
) : (
	appTree
);

createRoot(document.getElementById("root")).render(
	clerkPublishableKey ? (
		<ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
			{withGoogle}
		</ClerkProvider>
	) : (
		withGoogle
	)
);
