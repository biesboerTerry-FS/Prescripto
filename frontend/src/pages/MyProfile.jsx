import React, { useContext } from "react";
import { useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

// Renders the My Profile view.
const MyProfile = () => {
	const { userData, setUserData, token, backendURL, loadUserProfileData } =
		useContext(AppContext);

	const [isEdit, setIsEdit] = useState(false);
	const [image, setImage] = useState(false);

	// Helper that update user profile data.
	const updateUserProfileData = async () => {
		try {
			const formData = new FormData();
			formData.append("name", userData.name);
			formData.append("phone", userData.phone);
			formData.append("address", JSON.stringify(userData.address));
			formData.append("gender", userData.gender);
			formData.append("dob", userData.dob);

			image && formData.append("image", image);

			const { data } = await axios.put(
				`${backendURL}/api/user/update-profile`,
				formData,
				{ headers: { token } }
			);
			if (data.success) {
				toast.success(data.message);
				await loadUserProfileData();
				setIsEdit(false);
				setImage(false);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	return (
		userData && (
			<div className="flex flex-col max-w-lg gap-2 text-sm">
				{isEdit ? (
					<label htmlFor="image">
						<div className="relative inline-block cursor-pointer">
							<img
								className="rounded opacity-75 w-36"
								src={
									image
										? URL.createObjectURL(image)
										: userData.image
								}
								alt=""
							/>
							<img
								className="absolute w-10 bottom-12 right-12"
								src={image ? "" : assets.upload_icon}
								alt=""
							/>
						</div>
						<input
							onChange={(e) => setImage(e.target.files[0])}
							type="file"
							id="image"
							accept="image/*"
							aria-label="Profile photo"
							hidden
						/>
					</label>
				) : (
					<img
						className="rounded-full w-36"
						src={userData.image}
						alt=""
					/>
				)}

				{isEdit ? (
					<input
						aria-label="Full name"
						className="mt-4 text-3xl font-medium bg-gray-100 max-w-60"
						onChange={(event) =>
							setUserData((prev) => ({
								...prev,
								name: event.target.value,
							}))
						}
						type="text"
						value={userData.name}
					/>
				) : (
					<p className="mt-4 text-3xl font-medium text-neutral-800">
						{userData.name}
					</p>
				)}
				<hr className="bg-primary h-[2px] border-none" />
				<div>
					<p className="mt-1 underline u text-neutral-800">
						CONTACT INFORMATION
					</p>
					<div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
						<p className="font-medium">Email </p>
						{isEdit ? (
							<input
								aria-label="Email"
								className="bg-gray-100 max-w-52"
								onChange={(event) =>
									setUserData((prev) => ({
										...prev,
										email: event.target.value,
									}))
								}
								type="text"
								value={userData.email}
							/>
						) : (
							<p className="text-teal-700">{userData.email}</p>
						)}
						<p className="font-medium">Phone</p>
						{isEdit ? (
							<input
								aria-label="Phone"
								className="bg-gray-100 max-w-52"
								onChange={(event) =>
									setUserData((prev) => ({
										...prev,
										phone: event.target.value,
									}))
								}
								type="text"
								value={userData.phone}
							/>
						) : (
							<p className="text-teal-700">{userData.phone}</p>
						)}
						<p className="font-medium">Address</p>
						{isEdit ? (
							<p>
								<input
									aria-label="Address line 1"
									className="bg-gray-100 max-w-52"
									onChange={(event) =>
										setUserData((prev) => ({
											...prev,
											address: {
												...prev.address,
												line1: event.target.value,
											},
										}))
									}
									type="text"
									value={userData.address.line1}
								/>
								<br />
								<input
									aria-label="Address line 2"
									className="bg-gray-100 max-w-52"
									onChange={(event) =>
										setUserData((prev) => ({
											...prev,
											address: {
												...prev.address,
												line2: event.target.value,
											},
										}))
									}
									type="text"
									value={userData.address.line2}
								/>
							</p>
						) : (
							<p className="text-gray-500">
								{userData.address.line1}
								<br />
								{userData.address.line2}
							</p>
						)}
					</div>
				</div>
				<div>
					<p className="mt-3 underline u text-neutral-800">
						BASIC INFORMATION
					</p>
					<div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
						<p className="font-medium">Gender</p>
						{isEdit ? (
							<select
								aria-label="Gender"
								className="bg-gray-100 max-w-20"
								onChange={(event) =>
									setUserData((prev) => ({
										...prev,
										gender: event.target.value,
									}))
								}
								value={userData.gender}
							>
								<option>Please select</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
							</select>
						) : (
							<p className="text-gray-500">{userData.gender}</p>
						)}
						<p className="font-medium">Birthday</p>
						{isEdit ? (
							<input
								aria-label="Birthday"
								className="bg-gray-100 max-w-28"
								onChange={(event) =>
									setUserData((prev) => ({
										...prev,
										dob: event.target.value,
									}))
								}
								type="date"
								value={userData.dob}
							/>
						) : (
							<p className="text-gray-500">{userData.dob}</p>
						)}
					</div>
				</div>
				<div className="mt-10">
					{isEdit ? (
						<button
							className="px-8 py-2 transition-all border rounded-full border-primary hover:bg-primary hover:text-white"
							onClick={updateUserProfileData}
						>
							Update
						</button>
					) : (
						<button
							className="px-8 py-2 transition-all border rounded-full border-primary hover:bg-primary hover:text-white"
							onClick={() => setIsEdit(true)}
						>
							Edit
						</button>
					)}
				</div>
			</div>
		)
	);
};

export default MyProfile;
