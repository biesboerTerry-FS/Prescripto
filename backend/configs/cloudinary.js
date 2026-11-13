import { v2 as cloudinary } from "cloudinary";

/**
 * Configures the Cloudinary SDK with credentials from the environment.
 * Called once at startup; upload/delete calls elsewhere rely on this global config.
 */
const connectCloudinary = async () => {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_SECRET_KEY,
	});
};

export default connectCloudinary;
