import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import RESPONSE from "../enums/RESPONSE";
import Axios from "../utilities/Axios";

const logout = async (history) => {
	const res = await Axios.POST("/auth/logout");
	const data = res.data;

	if (res.success === RESPONSE.FAILURE) {
		console.log(data.message);
		history.push("/login");
	} else {
		history.push("/");
	}
};

function Logout() {
	const history = useHistory();
	useEffect(() => logout(history));
	return null;
}

export default Logout;
