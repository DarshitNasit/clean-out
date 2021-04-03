import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import store from "./redux/store";
import { Provider } from "react-redux";

import Home from "./components/Home";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Profile from "./components/Profile";
import AddItem from "./components/AddItem";
import ViewItem from "./components/ViewItem";
import Register from "./components/Register";
import UpdateItem from "./components/UpdateItem";
import AddService from "./components/AddService";
import PrivateRoute from "./components/PrivateRoute";
import UpdateProfile from "./components/UpdateProfile";
import ForgotPassword from "./components/ForgotPassword";
import CleaningCategory from "./components/CleaningCategory";

import { setUserFromStorage } from "./redux/actions";

function App() {
	setUserFromStorage(store);

	return (
		<Provider store={store}>
			<Router>
				<Header />
				<Route path="/" exact component={Home} />
				<Route path="/login" exact component={Login} />
				<Route path="/logout" exact component={Logout} />
				<Route path="/register" exact component={Register} />
				<Route path="/viewItem/:itemId" exact component={ViewItem} />
				<Route path="/forgotPassword" exact component={ForgotPassword} />
				<Route path="/cleaningCategory" exact component={CleaningCategory} />

				<Switch>
					<PrivateRoute path="/addItem" exact component={AddItem} />
					<PrivateRoute path="/profile" exact component={Profile} />
					<PrivateRoute path="/addService" exact component={AddService} />
					<PrivateRoute path="/updateProfile" exact component={UpdateProfile} />
					<PrivateRoute path="/updateItem/:itemId" exact component={UpdateItem} />
				</Switch>
				<Footer />
			</Router>
		</Provider>
	);
}

export default App;
