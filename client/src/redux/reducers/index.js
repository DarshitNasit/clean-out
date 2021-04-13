import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import homeReducer from "./homeReducer";
import adminReducer from "./adminReducer";

export default combineReducers({
	auth: authReducer,
	home: homeReducer,
	error: errorReducer,
	admin: adminReducer,
});
