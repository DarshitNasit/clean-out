import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

import Pagination from "../Pagination";
import { RESPONSE, ROLE } from "../../enums";
import { setError, setTargetUser } from "../../redux/actions";
import { Axios } from "../../utilities";

function Admin(props) {
	const { history, auth, error, admin, location } = props;
	const { setError, setTargetUser } = props;
	const { targetUser } = admin;

	const [page, setPage] = useState(1);
	const [count, setCount] = useState(0);
	const [search, setSearch] = useState("");
	const [tempSearch, setTempSearch] = useState("");
	const [searchBy, setSearchBy] = useState("phone");
	const [searchFor, setSearchFor] = useState("user");
	const [verification, setVerification] = useState("any");
	const [users, setUsers] = useState([]);
	const [totalUsers, setTotalUsers] = useState(0);
	const [totalWorkers, setTotalWorkers] = useState(0);
	const [totalItemOrders, setTotalItemOrders] = useState(0);
	const [totalShopkeepers, setTotalShopkeepers] = useState(0);
	const [totalServiceOrders, setTotalServiceOrders] = useState(0);

	useEffect(() => {
		getInitialData();
	}, [location.pathname]);

	async function getInitialData() {
		const res = await Axios.GET(`/admin`);
		setTotalUsers(res.data.totalUsers);
		setTotalWorkers(res.data.totalWorkers);
		setTotalItemOrders(res.data.totalItemOrders);
		setTotalShopkeepers(res.data.totalShopkeepers);
		setTotalServiceOrders(res.data.totalServiceOrders);
	}

	async function getUsers(search, searchBy, searchFor, verification, page) {
		const res = await Axios.GET(`/admin/users`, {
			search,
			searchBy,
			searchFor,
			verification,
			page,
		});
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setUsers(res.data.users);
		setCount(res.data.totalCount);
	}

	async function searchUser(event) {
		event.preventDefault();
		if (!tempSearch) return;
		setSearch(tempSearch);
		setPage(1);
		getUsers(tempSearch, searchBy, searchFor, verification, 1);
	}

	function changeSearchBy(value) {
		if (searchBy === value) return;
		setSearchBy(value);
	}

	function changeSearchFor(value) {
		if (searchFor === value) return;
		setSearchFor(value);
		if (value === "user") changeVerification("any");
	}

	function changeVerification(value) {
		if (verification === value) return;
		setVerification(value);
	}

	return (
		<div className="flex flex-col min-h80 btn-main">
			<div className="flex flex-col width90 ml-auto mr-auto mt-20">
				<div className="flex flex-row">
					<div className="flex flex-col">
						<p className="bold large-font-size">Admin</p>
						<div
							className="flex flex-row btn-white ml-auto p-20 mt-20"
							style={{
								boxShadow: `rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px,
		rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px,
		rgba(0, 0, 0, 0.09) 0px 32px 16px`,
							}}
						>
							<div className="flex flex-col">
								<p>Total Users</p>
								<p>Total Workers</p>
								<p>Total Shopkeepers</p>
								<p>Total Item Orders</p>
								<p>Total Service Orders</p>
							</div>

							<div className="flex flex-col ml-20">
								<p>: {totalUsers}</p>
								<p>: {totalWorkers}</p>
								<p>: {totalShopkeepers}</p>
								<p>: {totalItemOrders}</p>
								<p>: {totalServiceOrders}</p>
							</div>
						</div>
					</div>

					<div className="flex flex-col width60 ml-auto">
						<form
							className="flex flex-row align-center width80 ml-auto"
							onSubmit={searchUser}
						>
							<input
								type="text"
								placeholder={`Enter ${searchBy} ...`}
								value={tempSearch}
								onChange={(e) => setTempSearch(e.target.value)}
								style={{
									backgroundColor: "white",
									paddingLeft: "10px",
									width: "40%",
									fontSize: "0.9rem",
								}}
								className="ml-auto"
							/>

							<SearchRoundedIcon
								className="ml-10 hover-pointer"
								onClick={searchUser}
							/>
						</form>

						<div className="buttons ml-auto mt-10 mr-50">
							<p>Search By : </p>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchBy === "phone" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchBy("phone")}
							>
								Phone
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchBy === "pincode" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchBy("pincode")}
							>
								Pincode
							</button>
						</div>

						<div className="buttons ml-auto mt-10 mr-50">
							<p>Search For : </p>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchFor === "user" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchFor("user")}
							>
								User
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchFor === "worker" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchFor("worker")}
							>
								Worker
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									searchFor === "shopkeeper" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeSearchFor("shopkeeper")}
							>
								Shopkeeper
							</button>
						</div>

						<div className="buttons ml-auto mt-10 mr-50">
							<p>Verification : </p>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									verification === "any" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeVerification("any")}
							>
								Any
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									verification === "verified" ? "btn-violet white" : "btn-white"
								}`}
								onClick={() => changeVerification("verified")}
								hidden={searchFor === "user"}
							>
								Only Verified
							</button>
							<button
								className={`pl-10 pr-10 pt-5 pb-5 ml-5 mr-5 br-10 ${
									verification === "nonVerified"
										? "btn-violet white"
										: "btn-white"
								}`}
								onClick={() => changeVerification("nonVerified")}
								hidden={searchFor === "user"}
							>
								Only Non Verified
							</button>
						</div>
					</div>
				</div>

				<div className="flex flex-row flex-wrap">
					{users && users.length > 0 && (
						<div className="flex flex-row btn-white br-10 width40">
							<div className></div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
		error: state.error,
		admin: state.admin,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
		setTargetUser: (user) => dispatch(setTargetUser(user)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
