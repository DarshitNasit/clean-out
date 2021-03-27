const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storageEngine = multer.diskStorage({
	destination: process.env.TEMP_UPLOADS,
	filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});

const upload = multer({ storage: storageEngine }).fields([
	{ name: "profilePicture", maxCount: 1 },
	{ name: "proofs", maxCount: 2 },
	{ name: "itemImage", maxCount: 1 },
]);

module.exports = upload;
