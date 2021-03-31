import React, { useState, useEffect, useCallback } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ErrorText from "./ErrorText";
import ImageInput from "./ImageInput";
import ROLE from "../enums/ROLE";
import RESPONSE from "../enums/RESPONSE";
import Axios from "../utilities/Axios";
import { buildFormData } from "../utilities/FormData";

let initialValues = {};

const onSubmit = async (values, setError, history, user, profilePicture, proofs) => {
	setError(null);
	const resource =
		user.role === ROLE.USER ? "user" : values.role === ROLE.WORKER ? "worker" : "shopkeeper";

	let res, data;
	if (user.role === ROLE.USER) res = await Axios.PUT(`/${resource}/${user._id}`, values);
	else {
		data = { ...values, profilePicture, proofs };
		const { formData, headers } = buildFormData(data);
		res = await Axios.PUT(`/${resource}/${user._id}`, formData, headers);
	}

	data = res.data;
	if (res.success === RESPONSE.SUCCESS) {
		history.push("/");
	} else {
		setError(data.message);
	}
};

const validationSchema = Yup.object({
	userName: Yup.string().required("Required"),
	phone: Yup.string()
		.required("Required")
		.matches(/^[0-9]+$/, "Must be only digits")
		.length(10, "Must be 10 digits"),
	password: Yup.string().required("Required"),
	newPassword: Yup.string(),
	confirmPassword: Yup.string(),
	society: Yup.string().required("Required"),
	area: Yup.string().required("Required"),
	pincode: Yup.string().required("Required").length(6, "Invalid pincode"),
	city: Yup.string().required("Required"),
	state: Yup.string().required("Required"),
	pincodes: Yup.string(),
	shopName: Yup.string(),
});

const required = (value) => {
	return value === "" ? "Required" : null;
};

function UpdateProfile() {
	const history = useHistory();
	const [user, setUser] = useState(null);
	const [address, setAddress] = useState(null);
	const [worker, setWorker] = useState(null);
	const [shopkeeper, setShopkeeper] = useState(null);
	const [loading, setLoading] = useState(true);

	const [profilePicture, setProfilePicture] = useState(null);
	const [proofs, setProofs] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		getUser();

		async function getUser() {
			const res = await Axios.GET("/user/auth");
			const data = res.data;
			if (!data.user) history.push("/login");
			else {
				setUser(data.user);
				if (data.user.role === ROLE.WORKER) {
					const [resA, resW] = await Promise.all([
						Axios.GET(`/address/${data.user._id}`),
						Axios.GET(`/worker/workerOnly/${data.user._id}`),
					]);
					setAddress(resA.data.address);
					setWorker(resW.data.worker);
				} else if (data.user.role === ROLE.SHOPKEEPER) {
					const [resA, resS] = await Promise.all([
						Axios.GET(`/address/${data.user._id}`),
						Axios.GET(`/shopkeeper/shopkeeperOnly/${data.user._id}`),
					]);
					setAddress(resA.data.address);
					setShopkeeper(resS.data.shopkeeper);
				} else {
					const resA = await Axios.GET(`/address/${data.user._id}`);
					setAddress(resA.data.address);
				}

				setLoading(false);
			}
		}
	}, [history]);

	useEffect(() => {
		if (user) {
			initialValues.userName = user.userName;
			initialValues.phone = user.phone;
			initialValues.password = "";
			initialValues.newPassword = "";
			initialValues.confirmPassword = "";
		}
	}, [user]);

	useEffect(() => {
		if (address) {
			initialValues.society = address.society;
			initialValues.area = address.area;
			initialValues.pincode = address.pincode;
			initialValues.city = address.city;
			initialValues.state = address.state;
		}
	}, [address]);

	useEffect(() => {
		if (worker) initialValues.pincodes = worker.pincodes;
	}, [worker]);

	useEffect(() => {
		if (shopkeeper) initialValues.shopName = shopkeeper.shopName;
	}, [shopkeeper]);

	const onFileUpload = useCallback((name, files) => {
		if (name === "profilePicture") {
			setProfilePicture(files.length ? files[0] : null);
		} else if (files.length) {
			setProofs((prev) => {
				const next = prev ? [...prev, ...files] : files;
				return next.slice(Math.max(next.length - 2, 0));
			});
		}
	}, []);

	const confirmPasswordValidation = (pass, confPass) => {
		return pass === confPass ? null : "Passwords must match";
	};

	return (
		!loading && (
			<>
				<Header></Header>
				<div className="card_container">
					<h2 className="temp-white mt-20 mb-10">Register in to Clean Out</h2>
					{error ? <ErrorText>{error}</ErrorText> : null}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) =>
							onSubmit(values, setError, history, user, profilePicture, proofs)
						}
					>
						{(formik) => {
							return (
								<Form className="card mb-50">
									<div className="form-control">
										<label htmlFor="userName">Full Name</label>
										<Field type="text" id="userName" name="userName" />
										<ErrorMessage name="userName" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="phone">Contact Number</label>
										<Field type="text" id="phone" name="phone" />
										<ErrorMessage name="phone" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="password">Password</label>
										<Field type="password" id="password" name="password" />
										<ErrorMessage name="password" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="newPassword">New Password</label>
										<Field
											type="password"
											id="newPassword"
											name="newPassword"
										/>
										<ErrorMessage name="newPassword" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="confirmPassword">Confirm Password</label>
										<Field
											type="password"
											id="confirmPassword"
											name="confirmPassword"
											validate={(value) =>
												confirmPasswordValidation(
													formik.values.newPassword,
													value
												)
											}
										/>
										<ErrorMessage
											name="confirmPassword"
											component={ErrorText}
										/>
									</div>

									<div className="form-control">
										<label htmlFor="society">Society</label>
										<Field type="text" id="society" name="society" />
										<ErrorMessage name="society" component={ErrorText} />
									</div>

									<div className="form-control-2">
										<div className="form-control">
											<label htmlFor="area">Area</label>
											<Field type="text" id="area" name="area" />
											<ErrorMessage name="area" component={ErrorText} />
										</div>
										<div className="form-control">
											<label htmlFor="pincode">Pincode</label>
											<Field type="text" id="pincode" name="pincode" />
											<ErrorMessage name="pincode" component={ErrorText} />
										</div>
									</div>

									<div className="form-control-2">
										<div className="form-control">
											<label htmlFor="city">City</label>
											<Field type="text" id="city" name="city" />
											<ErrorMessage name="city" component={ErrorText} />
										</div>
										<div className="form-control">
											<label htmlFor="state">State</label>
											<Field type="text" id="state" name="state" />
											<ErrorMessage name="state" component={ErrorText} />
										</div>
									</div>

									{worker && (
										<>
											<div className="form-control-2">
												<div className="form-control">
													<label htmlFor="profilePicture">
														Profile Picture
													</label>
													<ImageInput
														name="profilePicture"
														onFileUpload={onFileUpload}
													/>
												</div>
												<div className="form-control">
													<label htmlFor="proofs">
														ID Proofs (max 2)
													</label>
													<ImageInput
														name="proofs"
														onFileUpload={onFileUpload}
														multiple
													/>
												</div>
											</div>
											<div className="form-control">
												<label htmlFor="pincodes">
													Pincodes of preferred locations
												</label>
												<Field
													type="text"
													id="pincodes"
													name="pincodes"
													placeholder="Comma separated values"
													validate={required}
												/>
												<ErrorMessage
													name="pincodes"
													component={ErrorText}
												/>
											</div>
										</>
									)}

									{shopkeeper && (
										<>
											<div className="form-control">
												<label htmlFor="proofs">ID Proofs (max 2)</label>
												<ImageInput
													name="proofs"
													onFileUpload={onFileUpload}
													multiple
												/>
											</div>

											<div className="form-control">
												<label htmlFor="shopName">Shop Name</label>
												<Field
													type="text"
													id="shopName"
													name="shopName"
													validate={required}
												/>
												<ErrorMessage
													name="shopName"
													component={ErrorText}
												/>
											</div>
										</>
									)}

									<button
										type="submit"
										disabled={
											!!(
												!formik.dirty ||
												!formik.isValid ||
												formik.isSubmitting ||
												(user.role === ROLE.WORKER &&
													(!profilePicture ||
														!formik.values.pincodes.length)) ||
												(user.role === ROLE.SHOPKEEPER &&
													!formik.values.shopName) ||
												(user.role !== ROLE.USER &&
													proofs &&
													!proofs.length)
											)
										}
										className="btn btn-success mt-10"
									>
										{formik.isSubmitting ? "Updating" : "Update"}
									</button>
								</Form>
							);
						}}
					</Formik>
				</div>
				<Footer></Footer>
			</>
		)
	);
}

export default UpdateProfile;
