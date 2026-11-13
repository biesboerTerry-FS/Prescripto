import React from "react";

const reviews = [
	{
		quote:
			"I booked a same-week slot in under two minutes. The reminder and the clear fee made the whole visit stress-free.",
		name: "Sarah T.",
		detail: "Booked with a General Physician",
	},
	{
		quote:
			"Finding a pediatrician who had weekend-friendly times used to take me days of phone calls. Here it took one search.",
		name: "Miguel O.",
		detail: "Booked with a Pediatrician",
	},
	{
		quote:
			"Cancelling freed the slot straight away and the process was honest about the fee. Simple, and it respects your time.",
		name: "Aisha B.",
		detail: "Booked with a Dermatologist",
	},
];

// Helper that derives initials from a name for display.
const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

// Renders the Testimonials UI.
const Testimonials = () => {
	return (
		<section className="flex flex-col items-center gap-4 my-16 text-gray-900">
			<h1 className="text-3xl font-medium">What patients say</h1>
			<p className="text-sm text-center text-slate-500 sm:w-1/2">
				Sample reviews from demo patients. Replace these with real feedback before launch.
			</p>
			<div className="grid w-full grid-cols-1 gap-5 mt-4 md:grid-cols-3">
				{reviews.map((review) => (
					<figure
						key={review.name}
						className="flex flex-col gap-4 p-6 bg-white border shadow-sm rounded-xl border-slate-200"
					>
						<span className="text-3xl leading-none text-teal-600" aria-hidden="true">
							“
						</span>
						<blockquote className="flex-1 text-sm leading-6 text-slate-600">
							{review.quote}
						</blockquote>
						<figcaption className="flex items-center gap-3 pt-4 border-t border-slate-100">
							<span className="flex items-center justify-center w-9 h-9 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
								{initials(review.name)}
							</span>
							<div>
								<p className="text-sm font-medium text-slate-800">{review.name}</p>
								<p className="text-xs text-slate-500">{review.detail}</p>
							</div>
						</figcaption>
					</figure>
				))}
			</div>
		</section>
	);
};

export default Testimonials;
