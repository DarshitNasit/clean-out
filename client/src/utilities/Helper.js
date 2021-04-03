import axios from "axios";
export { buildFormData, dataURLtoFile, isEmptyObject, setAuthToken, timeout };

function buildFormData(data) {
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
}

function dataURLtoFile(dataURL, filename) {
	const arr = dataURL.split(",");
	const mime = arr[0].match(/:(.*?);/)[1];
	const bstr = atob(arr[1]);

	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) u8arr[n] = bstr.charCodeAt(n);

	return new File([u8arr], filename, { type: mime });
}

function isEmptyObject(value) {
	return value && Object.keys(value).length === 0 && value.constructor === Object;
}

function setAuthToken(token) {
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete axios.defaults.headers.common["Authorization"];
	}
}

async function timeout(seconds) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
