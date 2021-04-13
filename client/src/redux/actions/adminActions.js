import { ADMIN_ACTION } from "../../enums";

export { setTargetUser };

function setTargetUser(user) {
	return {
		type: ADMIN_ACTION.SET_TARGET_USER,
		payload: user,
	};
}
