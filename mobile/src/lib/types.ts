export type Doctor = {
	_id: string;
	name: string;
	image: string;
	specialty: string;
	degree: string;
	experience: string;
	about: string;
	fees: number;
	available: boolean;
	address: { line1?: string; line2?: string };
	slots_booked?: Record<string, string[]>;
};

export type Appointment = {
	_id: string;
	doctorId: string;
	slotDate: string;
	slotTime: string;
	amount: number;
	cancelled: boolean;
	payment: boolean;
	doctorData: {
		name: string;
		image: string;
		specialty: string;
	};
};

export type Profile = {
	name: string;
	email: string;
	image?: string;
	phone?: string;
	address?: { line1?: string; line2?: string };
	gender?: string;
	dob?: string;
};
