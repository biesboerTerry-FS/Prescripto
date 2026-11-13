import type { Doctor } from "@/lib/types";

// Mirrors the web booking rules: weekdays only, 08:00-18:00, 30-minute slots,
// future times only, and anything already in slots_booked is hidden.

export type TimeSlot = { time: string; date: Date };
export type DaySlots = { key: string; date: Date; slots: TimeSlot[] };

export const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// M/D/YYYY, the format the backend and existing appointments use
export function formatSlotDate(date: Date) {
	return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// "09:00 AM", the same label the web app stores
export function formatSlotTime(date: Date) {
	const hours24 = date.getHours();
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const suffix = hours24 >= 12 ? "PM" : "AM";
	const hours12 = hours24 % 12 || 12;
	return `${String(hours12).padStart(2, "0")}:${minutes} ${suffix}`;
}

// Helper that build available days.
export function buildAvailableDays(doctor: Doctor, now = new Date(), days = 7): DaySlots[] {
	const result: DaySlots[] = [];

	for (let offset = 0; offset < days; offset++) {
		const day = new Date(now);
		day.setDate(now.getDate() + offset);
		if (day.getDay() === 0 || day.getDay() === 6) continue;

		const slotDate = formatSlotDate(day);
		const booked = doctor.slots_booked?.[slotDate] ?? [];
		const cursor = new Date(day);
		cursor.setHours(8, 0, 0, 0);
		const end = new Date(day);
		end.setHours(18, 0, 0, 0);

		const slots: TimeSlot[] = [];
		while (cursor < end) {
			if (cursor > now) {
				const time = formatSlotTime(cursor);
				if (!booked.includes(time)) {
					slots.push({ time, date: new Date(cursor) });
				}
			}
			cursor.setMinutes(cursor.getMinutes() + 30);
		}

		if (slots.length > 0) {
			result.push({ key: slotDate, date: new Date(day), slots });
		}
	}

	return result;
}
