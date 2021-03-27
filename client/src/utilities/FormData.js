export const buildFormData = (data) => {
	const keys = Object.keys(data);
	const formData = new FormData();

	keys.forEach((key) => {
		if (Array.isArray(data[key])) {
			data[key].forEach((value) => formData.append(key, value));
		} else {
			formData.append(key, data[key]);
		}
	});

	const headers = { "Content-Type": "multipart/form-data" };
	return { formData, headers };
};
