import { createRoot } from "react-dom/client";
import "./index.css";
import { initTheme } from "./lib/theme";

initTheme();
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/AppContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const appTree = (
	<BrowserRouter>
		<AppContextProvider>
			<App />
		</AppContextProvider>
	</BrowserRouter>
);

// Demo sign-in (patient + shared Google demo account) is always available, so
// the portfolio works without any external auth provider credentials.
createRoot(document.getElementById("root")).render(
	googleClientId ? (
		<GoogleOAuthProvider clientId={googleClientId}>
			{appTree}
		</GoogleOAuthProvider>
	) : (
		appTree
	)
);
