const path = require("path");
const sharp = require("sharp");
const { promisify } = require("util");

const handleError = require("./errorHandler");
const unlinkAsync = promisify(require("fs").unlink);

const deleteFiles = async (files, folder = "uploads") => {
	files = files.map((file) => `${process.env.PUBLIC_FOLDER}/${folder}/${file}`);
	await Promise.all(files.map(async (file) => unlinkAsync(file)));
};

const useSharp = async (files) => {
	try {
		await Promise.all(
			files.map(async (file) =>
				sharp(`${process.env.TEMP_UPLOADS}/${file}`)
					.resize((height = 500))
					.toFile(`${process.env.UPLOADS}/${file}`)
			)
		);

		await deleteFiles(files, "tempUploads");
	} catch (error) {
		handleError(error);
	}
};

module.exports = { deleteFiles, useSharp };
