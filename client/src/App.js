import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import "@fontsource/inknut-antiqua";
import "@fontsource/nunito";

import Home from "./components/Home";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Profile from "./components/Profile";
import AddItem from "./components/AddItem";
import Register from "./components/Register";
import UpdateItem from "./components/UpdateItem";
import AddService from "./components/AddService";
import UpdateProfile from "./components/UpdateProfile";
import ForgotPassword from "./components/ForgotPassword";
import CleaningCategory from "./components/CleaningCategory";

function App() {
	return (
		<>
			<Router>
				<Route path="/" exact component={Home} />
				<Route path="/login" exact component={Login} />
				<Route path="/logout" exact component={Logout} />
				<Route path="/profile" exact component={Profile} />
				<Route path="/addItem" exact component={AddItem} />
				<Route path="/register" exact component={Register} />
				<Route path="/updateItem" exact component={UpdateItem} />
				<Route path="/addService" exact component={AddService} />
				<Route path="/updateProfile" exact component={UpdateProfile} />
				<Route path="/forgotPassword" exact component={ForgotPassword} />
				<Route path="/cleaningCategory" exact component={CleaningCategory} />
			</Router>
		</>
	);
}

export default App;
