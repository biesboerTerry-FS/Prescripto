import multer from "multer";

// Memory storage so uploads work in serverless environments (e.g. Vercel)
// where the filesystem is read-only or ephemeral. Controllers pass the buffer
// to Cloudinary via upload_stream.
const storage = multer.memoryStorage();

// Multer instance used as route middleware for single/multi file uploads.
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
