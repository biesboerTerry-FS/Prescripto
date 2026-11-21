import { createRoot } from "react-dom/client";
import "./index.css";
import { initTheme } from "./lib/theme";

initTheme();
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/AppContext.jsx";
import DoctorContextProvider from "./context/DoctorContext.jsx";
import AdminContextProvider from "./context/AdminContext.jsx";
import HRContextProvider from "./context/HRContext.jsx";

createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<AdminContextProvider>
			<DoctorContextProvider>
				<AppContextProvider>
					<HRContextProvider>
						<App />
					</HRContextProvider>
				</AppContextProvider>
			</DoctorContextProvider>
		</AdminContextProvider>
	</BrowserRouter>
);
