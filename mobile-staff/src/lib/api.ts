import type { Appointment, Doctor } from "@/lib/types";

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
				...(token ? { admintoken: token } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});
	} catch {
		throw new ApiError(`Can't reach the server at ${BASE_URL}. Check EXPO_PUBLIC_API_URL.`);
	}

	const data = (await response.json()) as { success: boolean; message?: string } & T;
	if (!data.success) {
		if (token && /not authorized|jwt/i.test(data.message ?? "")) {
			throw new ApiError("Your admin session has expired. Please sign in again.");
		}
		throw new ApiError(data.message ?? "Something went wrong");
	}
	return data;
}

export async function adminLogin(email: string, password: string) {
	const data = await request<{ token: string }>("/api/admin/login", {
		method: "POST",
		body: { email, password },
	});
	return data.token;
}

export async function getDashboard(token: string) {
	return request<{ dashData: { doctors: number; patients: number; appointments: number; latestAppointments: Appointment[] } }>(
		"/api/admin/dashboard",
		{ token }
	);
}

export async function getAllDoctors(token: string) {
	const data = await request<{ doctors: Doctor[] }>("/api/admin/all-doctors", { method: "POST", token });
	return data.doctors;
}

export async function changeAvailability(token: string, doctorId: string) {
	await request("/api/admin/change-availability", { method: "POST", token, body: { doctorId } });
}

export async function getAllAppointments(token: string) {
	const data = await request<{ appointments: Appointment[] }>("/api/admin/appointments", { token });
	return [...(data.appointments || [])].reverse();
}

export async function cancelAppointment(token: string, appointmentId: string) {
	await request("/api/admin/cancel-appointment", { method: "PUT", token, body: { appointmentId } });
}

export async function getAllPatients(token: string) {
	const data = await request<{ patients: any[] }>("/api/admin/patients", { token });
	return data.patients || [];
}
