import { createContext } from "react";

export const DoctorContext = createContext();

// Renders the Doctor Context Provider UI.
const DoctorContextProvider = (props) => {
	const value = {};

	return (
		<DoctorContext.Provider value={value}>
			{props.children}
		</DoctorContext.Provider>
	);
};

export default DoctorContextProvider;
