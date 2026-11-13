import { createContext } from "react";

export const AppContext = createContext();

// Renders the App Context Provider UI.
const AppContextProvider = (props) => {
	const value = {};

	return (
		<AppContext.Provider value={value}>
			{props.children}
		</AppContext.Provider>
	);
};

export default AppContextProvider;
