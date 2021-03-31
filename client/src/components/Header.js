import React from "react";
import { Link } from "react-router-dom";

import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";

const scrollToBottom = () =>
	window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

function Header() {
	return (
		<div className="header_container">
			<div className="header_left">
				<span className="logo">Clean Out</span>
				<ul className="flex flex-row li-mr-20">
					<li>
						<Link className="white" to="/">
							HOME
						</Link>
					</li>
					<li>
						<button type="button" className="white btn-black" onClick={scrollToBottom}>
							CONTACT
						</button>
					</li>
					<li>
						<Link className="white" to="/">
							REQUESTED ORDERS
						</Link>
					</li>
				</ul>
			</div>

			<div className="header_right">
				<ul className="flex flex-row li-mr-20">
					<li>
						<Link className="white" to="/login">
							LOGIN
						</Link>
					</li>
					<li>
						<Link className="white" to="/logout">
							LOGOUT
						</Link>
					</li>
					<li>
						<Link className="white" to="/cart">
							<ShoppingCartIcon className="icon" />
						</Link>
					</li>
					<li>
						<Link className="white" to="/updateProfile">
							<AccountCircleIcon className="icon" />
						</Link>
					</li>
					<li>
						<NotificationsActiveIcon className="icon" />
					</li>
				</ul>
			</div>
		</div>
	);
}

export default Header;
