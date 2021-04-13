import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ErrorText from "./ErrorText";
import ViewServiceBar from "./ViewServiceBar";
import PaginationBar from "./PaginationBar";
import { setError } from "../redux/actions";
import { RESPONSE, ROLE } from "../enums";
import { Axios } from "../utilities";

function ViewAllServices(props) {
	const { history, location, auth, error } = props;
	const { setError } = props;

	const [page, setPage] = useState(0);
	const [lastKeys, setLastKeys] = useState([]);
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [previous, setPrevious] = useState(false);
	const [next, setNext] = useState(false);

	useEffect(() => {
		getUser();
		async function getUser() {
			if (auth.user.role === ROLE.WORKER) {
				const res = await Axios.GET(`/worker/${auth.user._id}`);
				if (res.success === RESPONSE.FAILURE) setError(res.data.message);
				else {
					if (res.data.worker.isDependent === "true") history.goBack();
					else getServices();
				}
			} else if (auth.user.role === ROLE.SHOPKEEPER) getServices();
			else history.goBack();
		}

		async function getServices() {
			const res = await Axios.GET(`/service/services/${auth.user._id}`);
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
			if (res.data.services.length) {
				setNext(true);
				const array = res.data.services;
				setServices(array);
				setLastKeys([array[array.length - 1]._id]);
			}
			setLoading(false);
		}

		return () => {
			setLoading(true);
		};
	}, [location.pathname]);

	useEffect(() => {
		setPrevious(!!page);
	}, [page]);

	function addService() {
		setError("");
		history.push("/addService");
	}

	function parseSubCategoryNames(subCategories) {
		if (!subCategories) return;
		let names = subCategories.map((subCategory) => subCategory.name);
		return names.join(", ");
	}

	async function onPrevious() {
		setError("");
		let lastKey = null;
		if (page >= 2) lastKey = lastKeys[page - 2];
		const res = await Axios.GET(`/service/services/${auth.user._id}`, { lastKey });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		const array = res.data.services;
		setServices(array);
		setPage((prevPage) => {
			setLastKeys((prevKeys) => {
				const newKeys = [...prevKeys];
				newKeys[prevPage - 1] = array[array.length - 1]._id;
				return newKeys;
			});
			return prevPage - 1;
		});
		setNext(true);
	}

	async function onNext() {
		setError("");
		const lastKey = lastKeys[page];
		if (!lastKey) return setNext(false);

		const res = await Axios.GET(`/service/services/${auth.user._id}`, { lastKey });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		if (res.data.services.length) {
			const array = res.data.services;
			setServices(array);
			setPage((prevPage) => {
				setLastKeys((prevKeys) => {
					const newKeys = [...prevKeys];
					newKeys[prevPage + 1] = array[array.length - 1]._id;
					return newKeys;
				});
				return prevPage + 1;
			});
		} else setNext(false);
	}

	return (
		<div className="width100 flex flex-col btn-main min-h80">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}

					<div className="width80 ml-auto mr-auto flex flex-col">
						<div className="flex flex-row p-10 align-center">
							<p className="bold large-font-size">Services</p>
							<button className="btn btn-violet ml-auto" onClick={addService}>
								Add Service
							</button>
						</div>

						{services.length > 0 && (
							<>
								{services.map((service) => (
									<ViewServiceBar
										key={service._id}
										serviceName={service.serviceName}
										serviceCategory={service.serviceCategory}
										subCategories={parseSubCategoryNames(service.subCategories)}
										className="btn-light mt-10 width100 hover-pointer"
										onClick={() => history.push(`/viewService/${service._id}`)}
									/>
								))}
								{services.length ? (
									<PaginationBar
										className="mt-20 mb-50"
										onPrevious={onPrevious}
										disablePrevious={!previous}
										onNext={onNext}
										disableNext={!next}
									/>
								) : (
									<p className="ml-auto mr-auto mt-50">No services found</p>
								)}
							</>
						)}
						{!services.length && <p className="ml-auto mr-auto">No services found</p>}
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllServices);
