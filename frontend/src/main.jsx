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

// Google sign-in is optional: without VITE_GOOGLE_CLIENT_ID the app runs
// exactly as before (email/password only).
createRoot(document.getElementById("root")).render(
	googleClientId ? (
		<GoogleOAuthProvider clientId={googleClientId}>
			{appTree}
		</GoogleOAuthProvider>
	) : (
		appTree
	)
);
