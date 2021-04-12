import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ErrorText from "./ErrorText";
import ViewServiceBar from "./ViewServiceBar";
import PaginationBar from "./PaginationBar";
import { setError } from "../redux/actions";
import { RESPONSE, ROLE } from "../enums";
import { Axios } from "../utilities";

function ViewAllRequestedOrders(props) {
	const { history, location, auth, error } = props;
	const { setError } = props;

	const [page, setPage] = useState(0);
	const [lastKeys, setLastKeys] = useState([]);
	const [itemOrders, setItemOrders] = useState([]);
	const [serviceOrders, setServiceOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [previous, setPrevious] = useState(false);
	const [next, setNext] = useState(false);

	useEffect(() => {
		getUser();
		async function getUser() {
			if (auth.user.role === ROLE.WORKER) {
				const res = await Axios.GET(`/worker/requestedOrders/${auth.user._id}`);
				if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

				const array = res.data.serviceOrders;
				if (array.length) {
					setServiceOrders(array);
					setLastKeys([array[array.length - 1]._id]);
					setNext(true);
				}
				setLoading(false);
			} else if (auth.user.role === ROLE.SHOPKEEPER) {
				const res = await Axios.GET(`/shopkeeper/requestedOrders/${auth.user._id}`);
				if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

				const [arrayI, arrayS] = [res.data.itemOrders, res.data.serviceOrders];
				if (arrayI.length || arrayS.length) {
					setItemOrders(arrayI);
					setServiceOrders(arrayS);
					setNext(true);
					const lastKey = {};
					if (arrayI.length) lastKey.lastKeyItemOrder = arrayI[arrayI.length - 1]._id;
					if (arrayS.length) lastKey.lastKeyServiceOrder = arrayS[arrayS.length - 1]._id;
					setLastKeys([lastKey]);
				}
				setLoading(false);
			} else history.goBack();
		}

		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	useEffect(() => {
		setPrevious(!!page);
	}, [page]);

	function parseSubCategoryNames(subCategories) {
		if (!subCategories) return;
		let names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	async function onPrevious() {
		setError("");

		if (auth.user.role === ROLE.WORKER) {
			let lastKey = null;
			if (page >= 2) lastKey = lastKeys[page - 2];
			const res = await Axios.GET(`/worker/requestedOrders/${auth.user._id}`, { lastKey });
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

			const array = res.data.serviceOrders;
			setServiceOrders(array);
			setPage((prevPage) => {
				setLastKeys((prevKeys) => {
					const newKeys = [...prevKeys];
					newKeys[prevPage - 1] = array[array.length - 1]._id;
					return newKeys;
				});
				return prevPage - 1;
			});
			setNext(true);
		} else if (auth.user.role === ROLE.SHOPKEEPER) {
			let lastKey = {};
			if (page >= 2) lastKey = lastKey[page - 2];
			const res = await Axios.GET(`/shopkeeper/requestedOrders/${auth.user._id}`, {
				...lastKey,
			});

			const [arrayI, arrayS] = [res.data.itemOrders, res.data.serviceOrders];
			setItemOrders(arrayI);
			setServiceOrders(arrayS);

			lastKey.lastKeyItemOrder = arrayI.length ? arrayI[arrayI.length - 1]._id : null;
			lastKey.lastKeyServiceOrder = arrayS.length ? arrayS[arrayS.length - 1]._id : null;
			setPage((prevPage) => {
				setLastKeys((prevKeys) => {
					const newKeys = [...prevKeys];
					newKeys[prevPage - 1] = lastKey;
					return newKeys;
				});
				return prevPage - 1;
			});
			setNext(true);
		}
	}

	async function onNext() {
		setError("");

		if (auth.user.role === ROLE.WORKER) {
			const lastKey = lastKeys[page];
			if (!lastKey) return setNext(false);

			const res = await Axios.GET(`/worker/requestedOrders/${auth.user._id}`, { lastKey });
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

			const array = res.data.serviceOrders;
			if (array.length) {
				setServiceOrders(array);
				setPage((prevPage) => {
					setLastKeys((prevKeys) => {
						const newKeys = [...prevKeys];
						newKeys[prevPage + 1] = array[array.length - 1]._id;
						return newKeys;
					});
					return prevPage + 1;
				});
			} else setNext(false);
		} else if (auth.user.role === ROLE.SHOPKEEPER) {
			const lastKey = lastKeys[page];
			if (!lastKey) return setNext(false);

			const res = await Axios.GET(`/shopkeeper/requestedOrders/${auth.user._id}`, {
				...lastKey,
			});
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

			const [arrayI, arrayS] = [res.data.itemOrders, res.data.serviceOrders];
			if (arrayI.length || arrayS.length) {
				setItemOrders(arrayI);
				setServiceOrders(arrayS);

				lastKey.lastKeyItemOrder = arrayI.length ? arrayI[arrayI.length - 1]._id : null;
				lastKey.lastKeyServiceOrder = arrayS.length ? arrayS[arrayS.length - 1]._id : null;
				setPage((prevPage) => {
					setLastKeys((prevKeys) => {
						const newKeys = [...prevKeys];
						newKeys[prevPage + 1] = lastKey;
						return newKeys;
					});
					return prevPage + 1;
				});
			} else setNext(false);
		}
	}

	return (
		<div className="min-h80 btn-main">
			{!loading && (
				<>
					<div className="flex flex-col width80 ml-auto mr-auto pt-10">
						{error.error && <ErrorText>{error.error}</ErrorText>}
						<p className="bold large-font-size mt-10 mb-20">Orders</p>
						{serviceOrders.length > 0 &&
							serviceOrders.map((serviceOrder) => (
								<div
									key={serviceOrder._id}
									className="flex flex-row btn-light br-10 hover-pointer"
									onClick={() =>
										history.push(`/viewServiceOrder/${serviceOrder._id}`)
									}
								>
									<ViewServiceBar
										serviceName={serviceOrder.service.serviceName}
										serviceCategory={serviceOrder.serviceCategory}
										subCategories={parseSubCategoryNames(serviceOrder.metaData)}
										price={serviceOrder.price}
										status={serviceOrder.status}
										className="mt-10 width70 mr-auto"
									/>
									<div className="mt-10 width30 ml-auto flex flex-col">
										<p className="big-font-size bold">
											{serviceOrder.user.userName}
										</p>
										<p className="small-font-size">{serviceOrder.user.phone}</p>
										<p className="small-font-size">
											{serviceOrder.address.society},{" "}
											{serviceOrder.address.area}, {serviceOrder.address.city}
											, {serviceOrder.address.state} -{" "}
											{serviceOrder.address.pincode}
										</p>
									</div>
								</div>
							))}

						{itemOrders.map((itemOrder) => (
							<div
								key={itemOrder._id}
								className="flex flex-row btn-light br-10 mb-10 hover-pointer"
								onClick={() => history.push(`/viewItemOrder/${itemOrder._id}`)}
							>
								<div className="flex flex-col width60 pt-10">
									{itemOrder.orderItemPacks.map((orderItemPack) => (
										<div
											key={orderItemPack._id}
											className="flex flex-row pl-10 mb-10"
										>
											<div className="flex flex-col">
												<p className="bold">
													{orderItemPack.item.itemName} [
													{orderItemPack.count}]
												</p>
												<p>Status : {orderItemPack.status}</p>
											</div>
											<p className="ml-auto">Price : {orderItemPack.price}</p>
										</div>
									))}
								</div>

								<div className="mt-10 mb-10 width30 ml-auto flex flex-col">
									<p className="big-font-size bold">{itemOrder.user.userName}</p>
									<p className="small-font-size">{itemOrder.user.phone}</p>
									<p className="small-font-size">
										{itemOrder.address.society}, {itemOrder.address.area},{" "}
										{itemOrder.address.city}, {itemOrder.address.state} -{" "}
										{itemOrder.address.pincode}
									</p>
								</div>
							</div>
						))}

						{serviceOrders?.length || itemOrders?.length ? (
							<PaginationBar
								className="mt-20 mb-50"
								onPrevious={onPrevious}
								disablePrevious={!previous}
								onNext={onNext}
								disableNext={!next}
							/>
						) : (
							<p className="ml-auto mr-auto mt-50">No orders found</p>
						)}
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
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllRequestedOrders);
