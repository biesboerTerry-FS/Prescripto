import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import api, { getApiErrorMessage } from "../../lib/api";

// Renders the Add Doctor view.
const AddDoctor = () => {
	const [doctorImage, setDoctorImage] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [experience, setExperience] = useState("Select");
	const [fees, setFees] = useState("");
	const [about, setAbout] = useState("");
	const [specialty, setSpecialty] = useState("Select");
	const [degree, setDegree] = useState("");
	const [address1, setAddress1] = useState("");
	const [address2, setAddress2] = useState("");

	// Helper that on submit handler.
	const onSubmitHandler = async (event) => {
		event.preventDefault();
		try {
			if (!doctorImage) {
				return toast.error("Image not selected");
			}
			// // ^ Validate addresses before submission
			// if (!address1 || !address2) {
			// 	return toast.error("Address lines cannot be empty.");
			// }

			const formData = new FormData();
			formData.append("image", doctorImage);
			formData.append("name", name);
			formData.append("email", email);
			formData.append("experience", experience);
			formData.append("fees", Number(fees));
			formData.append("about", about);
			formData.append("specialty", specialty);
			formData.append("degree", degree);
			formData.append(
				"address",
				JSON.stringify({ line1: address1, line2: address2 })
			);
			formData.forEach((value, key) => {
				console.log(`${key} : ${value}`);
			});

			const { data } = await api.post("/admin/add-doctor", formData);

			if (data.success) {
				toast.success(data.message || "Doctor added successfully.");
				setDoctorImage(false);
				setName("");
				setEmail("");
				setAddress1("");
				setAddress2("");
				setDegree("");
				setAbout("");
				setFees("");
				setExperience("Select");
				setSpecialty("Select");
			} else {
				toast.error(data.message || "An unexpected error occurred.");
			}
		} catch (error) {
			console.log(error);
			toast.error(getApiErrorMessage(error, "Could not add doctor."));
		}
	};

	return (
		<form onSubmit={onSubmitHandler} className="flex flex-col w-full h-[calc(100vh-7rem)] m-5">
			<p className="mb-3 text-lg font-medium">Add Doctor</p>
			<div className="flex flex-col flex-1 min-h-0 w-full max-w-4xl bg-white border rounded">
				<div className="flex-1 min-h-0 overflow-y-auto px-8 py-8" tabIndex={0}>
				<div className="flex items-start gap-4 mb-8 text-gray-500">
					<div className="flex flex-col items-center gap-1">
						<label
							htmlFor="doctorImage"
							className="cursor-pointer"
							aria-label="Upload photo"
						>
							<img
								className="w-16 bg-gray-100 rounded-full cursor-pointer"
								src={assets.upload_area}
								alt=""
							/>
						</label>
						<p className="text-xs">Upload photo</p>
					</div>
					{doctorImage && (
						<ul className="flex flex-wrap gap-3 m-0 p-0 list-none">
							<li className="flex flex-col items-center gap-1">
								<img
									className="w-16 h-16 object-cover rounded-full border border-slate-200"
									src={URL.createObjectURL(doctorImage)}
									alt={doctorImage.name}
								/>
								<button
									type="button"
									className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-50 text-primary hover:bg-teal-100"
									onClick={() => setDoctorImage(false)}
									aria-label={`Remove ${doctorImage.name}`}
								>
									Remove
								</button>
							</li>
						</ul>
					)}
					<input
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) setDoctorImage(file);
							// Reset so the same file can be picked again.
							e.target.value = "";
						}}
						type="file"
						id="doctorImage"
						accept="image/*"
						hidden
					/>
				</div>

				<div className="flex flex-col items-start gap-10 text-gray-600 lg:flex-row">
					<div className="flex flex-col gap-4 w-f lg:flex-1">
						<div className="flex flex-col flex-1 gap-1">
							<label htmlFor="doc-name" className="mb-3 text-lg font-medium block">Doctor Name</label>
							<input id="doc-name"
								onChange={(e) => setName(e.target.value)}
								value={name}
								className="px-3 py-2 border rounded"
								type="text"
								placeholder="Name"
								required
							/>
						</div>
						<div className="flex flex-col flex-1 gap-1">
							<label htmlFor="doc-email" className="mb-3 text-lg font-medium block">Doctor Email</label>
							<input id="doc-email"
								onChange={(e) => setEmail(e.target.value)}
								value={email}
								className="px-3 py-2 border rounded"
								type="email"
								placeholder="Email"
								required
							/>
						</div>
						<div className="flex flex-col flex-1 gap-1">
							<label htmlFor="doc-experience" className="mb-3 text-lg font-medium block">Experience</label>
							<select id="doc-experience" aria-label="Experience"
								onChange={(e) => setExperience(e.target.value)}
								value={experience}
								className="px-3 py-2 border rounded"
								name=""
								required
							>
								<option value="">Select</option>
								<option value="1 Year">1 Year</option>
								<option value="2 Years">2 Years</option>
								<option value="3 Years">3 Years</option>
								<option value="4 Years">4 Years</option>
								<option value="5 Years">5 Years</option>
								<option value="6 Years">6 Years</option>
								<option value="7 Years">7 Years</option>
								<option value="8 Years">8 Years</option>
								<option value="9 Years">9 Years</option>
								<option value="10 Years">10 Years</option>
							</select>
						</div>
						<div className="flex flex-col flex-1 gap-1">
							<label htmlFor="doc-fee" className="mb-3 text-lg font-medium block">Visit Fee</label>
							<input id="doc-fee"
								onChange={(e) => setFees(e.target.value)}
								value={fees}
								className="px-3 py-2 border rounded"
								type="number"
								placeholder="Fee"
								required
							/>
						</div>
					</div>
					<div className="flex flex-col w-full gap-4 lg:flex-1">
						<div className="flex flex-col flex-1 gap-1">
							<label htmlFor="doc-specialty" className="mb-3 text-lg font-medium block">Specialty</label>
							<select id="doc-specialty" aria-label="Specialty"
								onChange={(e) => setSpecialty(e.target.value)}
								value={specialty}
								className="px-3 py-2 border rounded"
								name=""
								required
							>
								<option value="">Select</option>
								<option value="General Physician">
									General Physician
								</option>
								<option value="Gynecologist">
									Gynecologist
								</option>
								<option value="Dermatologist">
									Dermatologist
								</option>
								<option value="Pediatrician">
									Pediatrician
								</option>
								<option value="Neurologist">Neurologist</option>
								<option value="Gastroenterologist">
									Gastroenterologist
								</option>
							</select>
						</div>
						<div className="flex flex-col flex-1 gap-1">
							<label htmlFor="doc-education" className="mb-3 text-lg font-medium block">Education</label>
							<input id="doc-education"
								onChange={(e) => setDegree(e.target.value)}
								value={degree}
								className="px-3 py-2 border rounded"
								type="text"
								placeholder="Education"
								required
							/>
						</div>
						<div className="flex flex-col flex-1 gap-1">
							<p className="mb-3 text-lg font-medium">Address</p>
							<input
								onChange={(e) => setAddress1(e.target.value)}
								value={address1}
								className="px-3 py-2 border rounded"
								type="text"
								placeholder="Address Line 1" aria-label="Address line 1"
								required
							/>
							<input
								onChange={(e) => setAddress2(e.target.value)}
								value={address2}
								className="px-3 py-2 border rounded"
								type="text"
								placeholder="Address Line 2" aria-label="Address line 2"
								required
							/>
						</div>
					</div>
				</div>
				<div>
					<label htmlFor="doc-about" className="mt-4 mb-2 block">About:</label>
					<textarea id="doc-about"
						onChange={(e) => setAbout(e.target.value)}
						value={about}
						className="w-full px-4 pt-2 border rounded"
						type="text"
						placeholder="About the Doctor"
						rows={5}
						required
					/>
				</div>
				</div>
				<div className="flex items-center justify-end px-8 py-4 bg-white border-t border-slate-200">
					<button
						type="submit"
						className="px-10 py-3 text-white rounded-full bg-primary hover:bg-primary-dark transition-colors"
					>
						Add Doctor
					</button>
				</div>
			</div>
		</form>
	);
};

export default AddDoctor;
