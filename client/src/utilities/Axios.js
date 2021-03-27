import axios from "axios";

const GET = async (URL, data, headers = null) => {
	const response = await (headers ? axios.get(URL, data, { headers }) : axios.get(URL, data));
	return await response.data;
};

const POST = async (URL, data, headers = null) => {
	const response = await (headers ? axios.post(URL, data, { headers }) : axios.post(URL, data));
	return await response.data;
};

const PUT = async (URL, data, headers = null) => {
	const response = await (headers ? axios.put(URL, data, { headers }) : axios.put(URL, data));
	return await response.data;
};

const DELETE = async (URL, data, headers = null) => {
	const response = await (headers
		? axios.delete(URL, { data, headers })
		: axios.delete(URL, { data }));
	return await response.data;
};

const Axios = { GET, POST, PUT, DELETE };
export default Axios;
