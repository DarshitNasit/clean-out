import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import RESPONSE from "../enums/RESPONSE";
import Axios from "../utilities/Axios";

function Logout() {
	const history = useHistory();
	useEffect(() => {
		async function getUser() {
			const res = await Axios.GET("/user/auth");
			const data = res.data;
			if (!data.user) history.push("/login");
			else logout();
		}
		async function logout() {
			const res = await Axios.POST("/auth/logout");
			if (res.success === RESPONSE.FAILURE) history.push("/login");
			else history.push("/");
		}
		getUser();
	}, [history]);

	return null;
}

export default Logout;
