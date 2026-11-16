import type { Appointment, Doctor, Profile } from "@/lib/types";

// Set EXPO_PUBLIC_API_URL in mobile/.env. Phones and emulators can't reach
// "localhost" on your computer: use your LAN IP (e.g. http://192.168.1.20:3000),
// or 10.0.2.2 for the Android emulator.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {}

type RequestOptions = {
	method?: "GET" | "POST" | "PUT";
	token?: string | null;
	body?: Record<string, unknown>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { method = "GET", token, body } = options;
	let response: Response;
	try {
		response = await fetch(`${BASE_URL}${path}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				...(token ? { token } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});
	} catch {
		throw new ApiError(`Can't reach the server at ${BASE_URL}. Check EXPO_PUBLIC_API_URL.`);
	}

	const data = (await response.json()) as { success: boolean; message?: string } & T;
	if (!data.success) {
		// The API reports bad or expired JWTs as "jwt ..." / "Not authorized"
		if (token && /jwt|not authorized/i.test(data.message ?? "")) {
			throw new ApiError("Your session has expired. Sign out and sign in again.");
		}
		throw new ApiError(data.message ?? "Something went wrong");
	}
	return data;
}

// Helper that login.
export async function login(email: string, password: string) {
	const data = await request<{ token: string }>("/api/user/login", {
		method: "POST",
		body: { email, password },
	});
	return data.token;
}

// Helper that register.
export async function register(name: string, email: string, password: string) {
	const data = await request<{ token: string }>("/api/user/register", {
		method: "POST",
		body: { name, email, password },
	});
	return data.token;
}

// Helper that sign in with google.
export async function signInWithGoogle(idToken: string) {
	const data = await request<{ token: string }>("/api/user/oauth-google", {
		method: "POST",
		body: { idToken },
	});
	return data.token;
}

// Signs in to the shared demo Google account when real OAuth isn't configured.
export async function signInWithGoogleDemo() {
	const data = await request<{ token: string }>("/api/user/oauth-google-demo", {
		method: "POST",
	});
	return data.token;
}

// Helper that get doctors.
export async function getDoctors() {
	const data = await request<{ doctors: Doctor[] }>("/api/doctor/list");
	return data.doctors;
}

// Helper that get profile.
export async function getProfile(token: string) {
	const data = await request<{ userData: Profile }>("/api/user/get-profile", { token });
	return data.userData;
}

// Helper that get appointments.
export async function getAppointments(token: string) {
	const data = await request<{ appointments: Appointment[] }>("/api/user/appointments", {
		token,
	});
	return [...data.appointments].reverse();
}

// Helper that cancel appointment.
export async function cancelAppointment(token: string, appointmentId: string) {
	await request<{ message: string }>("/api/user/cancel-appointment", {
		method: "PUT",
		token,
		body: { appointmentId },
	});
}

// Helper that book appointment.
export async function bookAppointment(
	token: string,
	doctorId: string,
	slotDate: string,
	slotTime: string
) {
	await request<{ message: string }>("/api/user/book-appointment", {
		method: "POST",
		token,
		body: { doctorId, slotDate, slotTime },
	});
}


export async function syncClerkSession(clerkToken: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/user/clerk-sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clerkToken}`,
      },
    });
  } catch {
    throw new ApiError(`Can't reach the server at ${BASE_URL}. Check EXPO_PUBLIC_API_URL.`);
  }
  const data = (await response.json()) as { success: boolean; token?: string; message?: string };
  if (!data.success || !data.token) {
    throw new ApiError(data.message ?? "Could not sign in with Clerk.");
  }
  return data.token;
}
