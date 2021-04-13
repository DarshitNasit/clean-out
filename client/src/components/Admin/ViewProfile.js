import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import Name from "../Name";
import ErrorText from "../ErrorText";
import ViewItemBar from "../ViewItemBar";
import ViewServiceBar from "../ViewServiceBar";
import { setError, logoutUser } from "../../redux/actions";
import { Axios } from "../../utilities";
import { RESPONSE, ROLE } from "../../enums";

function ViewProfile(props) {
	const { history, location, error } = props;
	const { setError } = props;

	const [tempUser, setTempUser] = useState(null);
	const [user, setUser] = useState(null);
	const [address, setAddress] = useState(null);
	const [worker, setWorker] = useState(null);
	const [workerShopkeeper, setWorkerShopkeeper] = useState(null);
	const [shopkeeper, setShopkeeper] = useState(null);
	const [itemOrders, setItemOrders] = useState([]);
	const [serviceOrders, setServiceOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// if (state && state.tempUser) setTempUser(state.tempUser);
		// else history.goBack();
		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	useEffect(() => {
		if (tempUser) getUserWithOrders();
	}, [tempUser]);

	// async function getUser() {
	// 	if (!phone) history.goBack();
	// 	const res = await Axios.GET(`/user/phone`, { phone });
	// 	if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
	// 	setTempUser(res.data.user);
	// }

	async function getUserWithOrders() {
		if (tempUser.role === ROLE.WORKER) {
			const res = await Axios.GET(`/worker/withOrders/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setUser(res.data.workerUser);
				setAddress(res.data.address);
				setWorker(res.data.worker);
				setItemOrders(res.data.itemOrders);
				setServiceOrders(res.data.serviceOrders);
				if (res.data.worker.isDependent === "true")
					setWorkerShopkeeper(res.data.shopkeeperUser);
				setLoading(false);
			}
		} else if (tempUser.role === ROLE.SHOPKEEPER) {
			const res = await Axios.GET(`/shopkeeper/withOrders/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setUser(res.data.shopkeeperUser);
				setAddress(res.data.address);
				setShopkeeper(res.data.shopkeeper);
				setItemOrders(res.data.itemOrders);
				setServiceOrders(res.data.serviceOrders);
				setLoading(false);
			}
		} else {
			const res = await Axios.GET(`/user/withOrders/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else {
				setUser(res.data.user);
				setAddress(res.data.address);
				setItemOrders(res.data.itemOrders);
				setServiceOrders(res.data.serviceOrders);
				setLoading(false);
			}
		}
	}

	function editProfile() {
		setError("");
		history.push("/admin/updateProfile", { tempUser });
	}

	async function deleteProfile() {
		setError("");
		if (tempUser.role === ROLE.WORKER) {
			const res = await Axios.DELETE(`/worker/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else history.goBack();
		} else if (tempUser.role === ROLE.SHOPKEEPER) {
			const res = await Axios.DELETE(`/shopkeeper/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else history.goBack();
		} else {
			const res = await Axios.DELETE(`/user/${tempUser._id}`);
			if (res.success === RESPONSE.FAILURE) setError(res.data.message);
			else history.goBack();
		}
	}

	async function leaveShop() {
		const res = await Axios.DELETE(`/worker/leaveShop/${tempUser._id}`);
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		setWorker((prevWorker) => {
			const newWorker = { ...prevWorker };
			newWorker.shopkeeperId = null;
			newWorker.isDependent = "false";
			return newWorker;
		});
		setWorkerShopkeeper(null);
	}

	async function verifyUser() {}

	function parseSubCategoryNames(subCategories) {
		let names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	return (
		<div className="flex flex-col btn-main min-h80">
			{!loading && (
				<>
					{error.error && (
						<ErrorText className="ml-auto mr-auto">{error.error}</ErrorText>
					)}
					<div className="flex flex-row">
						<div className="flex flex-col width40">
							<div className="flex flex-row width90 m-auto">
								<div>
									<Name
										className="mt-50 bold large-font-size"
										isVerified={
											(worker && worker.isVerified) ||
											(shopkeeper && shopkeeper.isVerified)
										}
									>
										{user && user.userName}
									</Name>
									<p>{user && user.phone}</p>
									{address && (
										<p>
											{address.society}, {address.area}, {address.city},{" "}
											{address.state} - {address.pincode}
										</p>
									)}
									{worker && (
										<div className="flex flex-row mt-5">
											<p>Preferred Locations : {worker.pincodes}</p>
										</div>
									)}
									{worker &&
										worker.isDependent === "true" &&
										workerShopkeeper && (
											<p className="mt-10">
												Shopkeeper : {workerShopkeeper.userName}
											</p>
										)}
								</div>

								{worker && (
									<img
										src={`/images/${worker.profilePicture}`}
										className="mt-50 ml-auto"
										height="160px"
										alt="profile picture"
									/>
								)}
							</div>
							<div className="buttons mr-auto ml-50 pt-20">
								<button className="btn btn-success" onClick={editProfile}>
									Edit
								</button>
								<button className="btn btn-danger ml-10" onClick={deleteProfile}>
									Delete
								</button>
								{worker && worker.isDependent === "true" && (
									<button className="btn btn-violet ml-10" onClick={leaveShop}>
										Leave Shop
									</button>
								)}
							</div>
						</div>

						<div className="width60">
							<div className="flex flex-col width90 m-auto">
								<div className="flex flex-row">
									{worker &&
										worker.proofs.map((proof) => (
											<a
												key={proof}
												href={`/images/${proof}`}
												target="_blank"
											>
												<img
													height="250"
													border="0"
													align="center"
													className="mt-10 mr-10"
													src=""
													alt="proof"
												/>
											</a>
											// <img
											// 	key={proof}
											// 	className="mt-10 mr-10"
											// 	src={`/images/${proof}`}
											// 	height="200px"
											// 	alt="Proof"
											// ></img>
										))}
									{shopkeeper &&
										shopkeeper.proofs.map((proof) => (
											<img
												key={proof}
												className="mt-10 mr-10"
												src={`/images/${proof}`}
												height="200px"
												alt="Proof"
											></img>
										))}
								</div>
								<div className="buttons mt-20 mr-auto">
									{shopkeeper && (
										<button
											className="btn btn-violet"
											onClick={() =>
												history.push("/admin/viewAllItems", { tempUser })
											}
										>
											Items
										</button>
									)}
									{(shopkeeper || (worker && worker.isDependent !== "true")) && (
										<button
											className="btn btn-violet ml-10"
											onClick={() =>
												history.push("/admin/viewAllServices", { tempUser })
											}
										>
											Services
										</button>
									)}
									{shopkeeper && (
										<button
											className="btn btn-violet ml-10"
											onClick={() =>
												history.push("/viewAllWorkers", { tempUser })
											}
										>
											Workers
										</button>
									)}
									{(shopkeeper || worker) && (
										<button
											className="btn btn-success ml-10"
											onClick={verifyUser}
											disabled={
												(shopkeeper && shopkeeper.isVerified) ||
												(worker && worker.isVerified)
											}
										>
											Verified
										</button>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-row mt-20 btn-light flex-grow pb-50">
						<div className="flex flex-col width50 mt-20">
							<p className="ml-auto mr-auto">Previous Services Orders</p>
							{serviceOrders.map((serviceOrder) => (
								<ViewServiceBar
									key={serviceOrder.serviceOrder._id}
									serviceName={serviceOrder.service.serviceName}
									serviceCategory={serviceOrder.service.serviceCategory}
									subCategories={parseSubCategoryNames(
										serviceOrder.service.subCategories
									)}
									price={serviceOrder.serviceOrder.price}
									workerName={serviceOrder.workerUser.userName}
									status={serviceOrder.serviceOrder.status}
									className="mt-10 btn-main hover-pointer"
									onClick={() =>
										history.push(
											`/viewServiceOrder/${serviceOrder.serviceOrder._id}`,
											{ tempUser }
										)
									}
								/>
							))}
						</div>
						<div className="flex flex-col width50 mt-20">
							<p className="ml-auto mr-auto">Previous Cleaning Items Orders</p>
							{itemOrders.map((itemOrder) => (
								<ViewItemBar
									key={itemOrder.itemOrder._id}
									orderItemPacks={itemOrder.orderItemPacks}
									className="mt-10 btn-main hover-pointer"
									onClick={
										(() =>
											history.push(
												`/viewItemOrder/${itemOrder.itemOrder._id}`
											),
										{ tempUser })
									}
								/>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
		error: state.error,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
		logoutUser: (history) => logoutUser(history)(dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewProfile);
