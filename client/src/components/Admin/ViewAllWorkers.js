import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import Worker from "./Worker";
import ErrorText from "./ErrorText";
import PaginationBar from "./PaginationBar";
import { setError } from "../redux/actions";
import { RESPONSE, ROLE } from "../enums";
import { Axios } from "../utilities";

function ViewAllWorkers(props) {
	const { history, location, auth, error } = props;
	const { setError } = props;

	const [page, setPage] = useState(0);
	const [lastKeys, setLastKeys] = useState([]);
	const [workers, setWorkers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [previous, setPrevious] = useState(false);
	const [next, setNext] = useState(false);

	useEffect(() => {
		getUser();
		async function getUser() {
			if (auth.user.role === ROLE.SHOPKEEPER) {
				getWorkers();
			} else history.goBack();
		}

		async function getWorkers() {
			const res = await Axios.GET(`/shopkeeper/workers/${auth.user._id}`);
			if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
			if (res.data.workers.length) {
				setNext(true);
				const array = res.data.workers;
				setWorkers(array);
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

	function addWorker() {
		setError("");
		history.push("/addWorker");
	}

	async function onPrevious() {
		setError("");
		let lastKey = null;
		if (page >= 2) lastKey = lastKeys[page - 2];
		const res = await Axios.GET(`/shopkeeper/workers/${auth.user._id}`, { lastKey });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);

		const array = res.data.workers;
		setWorkers(array);
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

		const res = await Axios.GET(`/shopkeeper/workers/${auth.user._id}`, { lastKey });
		if (res.success === RESPONSE.FAILURE) return setError(res.data.message);
		if (res.data.workers.length) {
			const array = res.data.workers;
			setWorkers(array);
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
		<div className="flex flex-col min-h80 btn-main width100">
			{!loading && (
				<>
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="width80 ml-auto mr-auto flex flex-col">
						<div className="flex flex-row p-10 align-center">
							<p className="bold large-font-size">Workers</p>
							<button className="btn btn-violet ml-auto" onClick={addWorker}>
								Add Workers
							</button>
						</div>
						<div className="flex flex-row flex-wrap">
							{workers.map((worker) => (
								<Worker
									key={worker.workerUser._id}
									workerUser={worker.workerUser}
									worker={worker.worker}
									className="btn-light mt-20 hover-pointer ml-auto mr-auto"
									onClick={() => history.push(`/viewWorker/${worker._id}`)}
								/>
							))}
						</div>
						{workers.length ? (
							<PaginationBar
								className="mt-20 mb-50"
								onPrevious={onPrevious}
								disablePrevious={!previous}
								onNext={onNext}
								disableNext={!next}
							/>
						) : (
							<p className="ml-auto mr-auto mt-50">No workers found</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewAllWorkers);
