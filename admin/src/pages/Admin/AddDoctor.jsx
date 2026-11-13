import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

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

	const { backendURL, adminToken } = useContext(AdminContext);

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

			const { data } = await axios.post(
				`${backendURL}/api/admin/add-doctor`,
				formData,
				{ headers: { adminToken } }
			);

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
			// if (error.response) {
			// 	// ^ Server responded with a status code outside 2xx range
			// 	toast.error(
			// 		error.response.data?.message || "API error occurred."
			// 	);
			// 	console.log("API Error:", error.response.data);
			// } else if (error.request) {
			// 	// ^ No response received from server
			// 	toast.error("No response from server. Check your network.");
			// 	console.log("No Response:", error.request);
			// } else {
			// 	// ^ Something else caused the error
			// 	toast.error(error.message || "Unknown error occurred.");
			// 	console.log("Error Details:", error.message);
			// }
			console.log(error);
			toast.error(error.message);
		}
	};

	return (
		<form onSubmit={onSubmitHandler} className="flex flex-col w-full h-[calc(100vh-7rem)] m-5">
			<p className="mb-3 text-lg font-medium">Add Doctor</p>
			<div className="flex flex-col flex-1 min-h-0 w-full max-w-4xl bg-white border rounded">
				<div className="flex-1 min-h-0 overflow-y-auto px-8 py-8" tabIndex={0}>
				<div className="flex items-center gap-4 mb-8 text-gray-500">
					<label htmlFor="doctorImage">
						<img
							className="w-16 bg-gray-100 rounded-full cursor-pointer"
							src={
								doctorImage
									? URL.createObjectURL(doctorImage)
									: assets.upload_area
							}
							alt=""
						/>
					</label>
					<input
						onChange={(e) => setDoctorImage(e.target.files[0])}
						type="file"
						id="doctorImage"
						hidden
					/>
					<p>Upload photo</p>
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
