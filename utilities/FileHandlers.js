const path = require("path");
const sharp = require("sharp");
const { promisify } = require("util");

const handleError = require("./errorHandler");
const unlinkAsync = promisify(require("fs").unlink);

const deleteFiles = async (files, folder = "uploads") => {
	files = files.map((file) => `public/${folder}/${file}`);
	await Promise.all(files.map(async (file) => unlinkAsync(file)));
};

const useSharp = async (files) => {
	try {
		await Promise.all(
			files.map(async (file) =>
				sharp(`public/tempUploads/${file}`)
					.resize((height = 500))
					.toFile(`public/uploads/${file}`)
			)
		);

		await deleteFiles(files, "tempUploads");
	} catch (error) {
		handleError(error);
	}
};

module.exports = { deleteFiles, useSharp };
