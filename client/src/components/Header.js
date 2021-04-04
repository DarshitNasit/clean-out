import React from "react";
import { Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";

import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import { ROLE } from "../enums";

const scrollToBottom = () =>
	window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

function Header(props) {
	const { history, auth } = props;

	function handleClick(event) {
		history.push(`/${event.target.name}`);
	}

	return (
		<div className="header_container">
			<div className="flex flex-row">
				<span className="logo">Clean Out</span>
				<ul className="flex flex-row li-mr-20 align-center">
					<li>
						<button name="" className="white btn-black" onClick={handleClick}>
							HOME
						</button>
					</li>
					<li>
						<button className="white btn-black" onClick={scrollToBottom}>
							CONTACT
						</button>
					</li>
					{auth.isAuthenticated &&
						[ROLE.SHOPKEEPER, ROLE.WORKER].includes(auth.user.role) && (
							<li>
								<button name="" className="white btn-black" onClick={handleClick}>
									REQUESTED ORDERS
								</button>
							</li>
						)}
				</ul>
			</div>

			<div className="flex flex-row">
				<ul className="flex flex-row li-mr-20 align-center">
					{!auth.isAuthenticated && (
						<li>
							<button name="login" className="white btn-black" onClick={handleClick}>
								LOGIN
							</button>
						</li>
					)}
					{auth.isAuthenticated && (
						<li>
							<button name="logout" className="white btn-black" onClick={handleClick}>
								LOGOUT
							</button>
						</li>
					)}
					{auth.isAuthenticated && (
						<>
							<li>
								<button
									name="cart"
									className="white btn-black"
									onClick={handleClick}
								>
									<ShoppingCartIcon className="icon" />
								</button>
							</li>
							<li>
								<button
									name="viewProfile"
									className="white btn-black"
									onClick={handleClick}
								>
									<AccountCircleIcon className="icon" />
								</button>
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

export default connect(mapStateToProps)(withRouter(Header));
