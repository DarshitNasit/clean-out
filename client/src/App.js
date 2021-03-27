import "./App.css";
import "@fontsource/inknut-antiqua";
import "@fontsource/nunito";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Login from "./components/Login";
import Logout from "./components/Logout";
import Profile from "./components/Profile";
import AddItem from "./components/AddItem";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";

function App() {
	return (
		<>
			<Router>
				<div className="App">
					<Route path="/login" exact component={Login} />
					<Route path="/logout" exact component={Logout} />
					<Route path="/profile" exact component={Profile} />
					<Route path="/addItem" exact component={AddItem} />
					<Route path="/register" exact component={Register} />
					<Route path="/forgotPassword" exact component={ForgotPassword} />
				</div>
			</Router>
		</>
	);
}

export default App;
