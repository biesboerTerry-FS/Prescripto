import type { Profile } from "@/lib/types";

// Web-only demo fallback: if the API is unreachable, keep the edited profile in
// localStorage so portfolio visitors can still try the edit flow. Native apps
// have no window.localStorage, so this is simply a no-op there.
const PREFIX = "prescripto.profile.";

// Store a short, non-reversible fingerprint instead of the raw session token.
function keyFor(token: string) {
	let hash = 0;
	for (let i = 0; i < token.length; i += 1) {
		hash = ((hash << 5) - hash + token.charCodeAt(i)) | 0;
	}
	return `${PREFIX}${hash}`;
}

function storage(): Storage | null {
	try {
		if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
	} catch {
		// Storage can be blocked in private browsing modes.
	}
	return null;
}

export function readCachedProfile(token: string): Profile | null {
	const store = storage();
	if (!store || !token) return null;
	try {
		const raw = store.getItem(keyFor(token));
		return raw ? (JSON.parse(raw) as Profile) : null;
	} catch {
		return null;
	}
}

export function writeCachedProfile(token: string, profile: Profile) {
	const store = storage();
	if (!store || !token) return;
	try {
		store.setItem(keyFor(token), JSON.stringify(profile));
	} catch {
		// Ignore quota/serialization failures — API persistence is the primary path.
	}
}

export function clearCachedProfile(token: string) {
	const store = storage();
	if (!store || !token) return;
	try {
		store.removeItem(keyFor(token));
	} catch {
		// No-op.
	}
}
