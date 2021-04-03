import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import { ROLE } from "../enums";

const scrollToBottom = () =>
	window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

function Header(props) {
	const { auth } = props;
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
					{auth.isAuthenticated &&
						[ROLE.SHOPKEEPER, ROLE.WORKER].includes(auth.user.role) && (
							<li>
								<Link className="white" to="/">
									REQUESTED ORDERS
								</Link>
							</li>
						)}
				</ul>
			</div>

			<div className="header_right">
				<ul className="flex flex-row li-mr-20">
					{!auth.isAuthenticated && (
						<li>
							<Link className="white" to="/login">
								LOGIN
							</Link>
						</li>
					)}
					{auth.isAuthenticated && (
						<li>
							<Link className="white" to="/logout">
								LOGOUT
							</Link>
						</li>
					)}
					{auth.isAuthenticated && (
						<>
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
						</>
					)}
					{auth.isAuthenticated && auth.user.role === ROLE.WORKER && (
						<li>
							<NotificationsActiveIcon className="icon" />
						</li>
					)}
				</ul>
			</div>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
	};
}

export default connect(mapStateToProps)(Header);
