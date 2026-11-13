import multer from "multer";

// Stores uploaded files on disk using their original names so controllers (e.g. add doctor)
// can pass the temp path to Cloudinary before it gets cleaned up.
const storage = multer.diskStorage({
	filename: function (request, file, callback) {
		callback(null, file.originalname);
	},
});

// Multer instance used as route middleware for single/multi file uploads.
const upload = multer({
	storage,
});

export default upload;
