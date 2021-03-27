import "./App.css";
import "@fontsource/inknut-antiqua";
import "@fontsource/nunito";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Register from "./components/Register";

function App() {
	return (
		<Router>
			<div className="App">
				<Route path="/register" exact component={Register} />
			</div>
		</Router>
	);
}

export default App;
