import { ADMIN_ACTION } from "../../enums";
import { isEmptyObject } from "../../utilities";

const initialState = {
	isLoaded: false,
	targetUser: null,
};

export default function (state = initialState, action) {
	switch (action.type) {
		case ADMIN_ACTION.SET_TARGET_USER:
			return {
				isLoaded: !isEmptyObject(action.payload),
				targetUser: action.payload,
			};

		default:
			return state;
	}
}
