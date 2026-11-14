const STORAGE_KEY = "prescripto_cookie_consent";
const CONSENT_VERSION = 2;

const defaultConsent = () => ({
	version: CONSENT_VERSION,
	timestamp: null,
	essential: true,
	preferences: false,
	decision: null, // "accepted" | "declined" | "custom" | null
});

// Reads stored consent. Returns null if none or invalid/old format needs migration.
export const getConsent = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		// Migrate legacy string values
		if (parsed === "accepted" || raw === '"accepted"') {
			return {
				version: CONSENT_VERSION,
				timestamp: new Date().toISOString(),
				essential: true,
				preferences: true,
				decision: "accepted",
			};
		}
		if (parsed === "declined" || raw === '"declined"') {
			return {
				version: CONSENT_VERSION,
				timestamp: new Date().toISOString(),
				essential: true,
				preferences: false,
				decision: "declined",
			};
		}
		if (typeof parsed === "object" && parsed && parsed.version === CONSENT_VERSION) {
			return { ...defaultConsent(), ...parsed, essential: true };
		}
		return null;
	} catch {
		return null;
	}
};

export const hasConsentDecision = () => {
	const consent = getConsent();
	return consent !== null && consent.decision !== null;
};

export const hasPreferencesConsent = () => {
	const consent = getConsent();
	return Boolean(consent && consent.preferences);
};

export const setConsent = (partial) => {
	const prev = getConsent() || defaultConsent();
	const next = {
		...prev,
		...partial,
		version: CONSENT_VERSION,
		timestamp: new Date().toISOString(),
		essential: true,
	};
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		// ignore storage errors
	}
	window.dispatchEvent(new CustomEvent("prescripto-consent-change", { detail: next }));
	return next;
};

export const openConsentSettings = () => {
	window.dispatchEvent(new CustomEvent("prescripto-consent-open"));
};

export const onConsentChange = (handler) => {
	const listener = (e) => handler(e.detail || getConsent());
	window.addEventListener("prescripto-consent-change", listener);
	return () => window.removeEventListener("prescripto-consent-change", listener);
};

export const onConsentOpen = (handler) => {
	window.addEventListener("prescripto-consent-open", handler);
	return () => window.removeEventListener("prescripto-consent-open", handler);
};
