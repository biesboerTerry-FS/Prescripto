import {
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "prescripto.adminToken";

type SessionValue = {
	token: string | null;
	isLoading: boolean;
	signIn: (token: string) => Promise<void>;
	signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		SecureStore.getItemAsync(TOKEN_KEY)
			.then(setToken)
			.finally(() => setIsLoading(false));
	}, []);

	const signIn = useCallback(async (newToken: string) => {
		await SecureStore.setItemAsync(TOKEN_KEY, newToken);
		setToken(newToken);
	}, []);

	const signOut = useCallback(async () => {
		await SecureStore.deleteItemAsync(TOKEN_KEY);
		setToken(null);
	}, []);

	const value = useMemo(
		() => ({ token, isLoading, signIn, signOut }),
		[token, isLoading, signIn, signOut]
	);

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
	const value = use(SessionContext);
	if (!value) {
		throw new Error("useSession must be used inside <SessionProvider>");
	}
	return value;
}
