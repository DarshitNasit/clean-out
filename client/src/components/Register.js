import React, { useState, useCallback } from "react";
import * as Yup from "yup";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ErrorText from "./ErrorText";
import Canvas from "./Canvas";
import ROLE from "../enums/ROLE";
import RESPONSE from "../enums/RESPONSE";
import Axios from "../utilities/Axios";
import { buildFormData } from "../utilities/FormData";

const initialValues = {
	userName: "",
	phone: "",
	password: "",
	confirmPassword: "",
	society: "",
	area: "",
	pincode: "",
	city: "",
	state: "",
	role: "USER",
	pincodes: "",
	shopName: "",
};

const onSubmit = async (values, setError, history, profilePicture, proofs) => {
	setError(null);
	const resource =
		values.role === ROLE.USER ? "user" : values.role === ROLE.WORKER ? "worker" : "shopkeeper";

	let res, data;
	if (values.role === ROLE.USER) res = await (await axios.post(`/${resource}`, values)).data;
	else {
		data = { ...values, profilePicture, proofs };
		const formData = buildFormData(data);
		const headers = { "Content-Type": "multipart/form-data" };
		res = await Axios.POST(`/${resource}`, formData, headers);
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
	confirmPassword: Yup.string()
		.required("Required")
		.oneOf([Yup.ref("password"), null], "Passwords must match"),
	society: Yup.string().required("Required"),
	area: Yup.string().required("Required"),
	pincode: Yup.string().required("Required").length(6, "Invalid pincode"),
	city: Yup.string().required("Required"),
	state: Yup.string().required("Required"),
	role: Yup.string().required("Required"),
	pincodes: Yup.string(),
	shopName: Yup.string(),
});

function Register() {
	const [error, setError] = useState(null);
	const history = useHistory();

	const [profilePicture, setProfilePicture] = useState(null);
	const [profilePictureError, setProfilePictureError] = useState(null);

	const [proofs, setProofs] = useState([]);
	const [proofsError, setProofsError] = useState([]);

	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [cameraFor, setCameraFor] = useState("default");

	const onFileUpload = useCallback((event) => {
		const name = event.target.name;
		const files = event.target.files;
		if (name === "profilePicture") {
			setProfilePictureError(null);
			setProfilePicture(files[0]);
		} else {
			const arr = [files[0]];
			if (files[1]) arr.push(files[1]);
			setProofsError(null);
			setProofs(arr);
		}
	}, []);

	const toggleCamera = useCallback((event) => {
		setIsCameraOpen((prev) => {
			setCameraFor(prev ? null : event.target.name);
			return !prev;
		});
	}, []);

	const captureImage = (file) => {
		if (cameraFor === "profilePicture") {
			setProfilePicture(file);
		} else {
			setProofs((prev) => {
				if (prev.length <= 1) return [...prev, file];
				else return [prev[1], file];
			});
		}
	};

	return (
		<>
			<Header></Header>
			{isCameraOpen && <Canvas captureImage={captureImage} />}

			<div className="card_container">
				<h2 className="temp-white mt-20 mb-10">Register in to Clean Out</h2>
				{error ? <ErrorText>{error}</ErrorText> : null}
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={(values) =>
						onSubmit(values, setError, history, profilePicture, proofs)
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
									<label htmlFor="confirmPassword">Confirm Password</label>
									<Field
										type="password"
										id="confirmPassword"
										name="confirmPassword"
									/>
									<ErrorMessage name="confirmPassword" component={ErrorText} />
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

								<div className="form-control-2">
									<div className="form-control">
										<label htmlFor="role">For:</label>
										<Field
											className="role_select"
											as="select"
											name="role"
											id="role"
										>
											<option value="USER">Customer</option>
											<option value="SHOPKEEPER">Shopkeeper</option>
											<option value="WORKER">Worker</option>
										</Field>
									</div>
									{formik.values.role === ROLE.SHOPKEEPER && (
										<div className="form-control">
											<label htmlFor="proofs">ID Proofs (max 2)</label>
											<input
												type="file"
												multiple
												id="proofs"
												name="proofs"
												onChange={onFileUpload}
											/>
											<button
												type="button"
												className="btn camera"
												name="proofs"
												onClick={toggleCamera}
												disabled={isCameraOpen && cameraFor !== "proofs"}
											>
												Camera
											</button>
											{proofsError && <ErrorText>{proofsError}</ErrorText>}
										</div>
									)}
								</div>

								{formik.values.role === ROLE.WORKER && (
									<div className="form-control-2">
										<div className="form-control">
											<label htmlFor="profilePicture">Profile Picture</label>
											<input
												type="file"
												id="profilePicture"
												name="profilePicture"
												onChange={onFileUpload}
											/>
											<button
												type="button"
												className="btn camera"
												name="profilePicture"
												onClick={toggleCamera}
												disabled={
													isCameraOpen && cameraFor !== "profilePicture"
												}
											>
												Camera
											</button>
											{profilePictureError && (
												<ErrorText>{profilePictureError}</ErrorText>
											)}
										</div>
										<div className="form-control">
											<label htmlFor="proofs">ID Proofs (max 2)</label>
											<input
												type="file"
												multiple
												id="proofs"
												name="proofs"
												onChange={onFileUpload}
											/>
											<button
												type="button"
												className="btn camera"
												name="proofs"
												onClick={toggleCamera}
												disabled={isCameraOpen && cameraFor !== "proofs"}
											>
												Camera
											</button>
											{proofsError && <ErrorText>{proofsError}</ErrorText>}
										</div>
									</div>
								)}

								{formik.values.role === ROLE.WORKER && (
									<div className="form-control">
										<label htmlFor="pincodes">
											Pincodes of preferred locations
										</label>
										<Field
											type="text"
											id="pincodes"
											name="pincodes"
											placeholder="Comma separated values"
										/>
										<ErrorMessage name="pincodes" component={ErrorText} />
									</div>
								)}

								{formik.values.role === ROLE.SHOPKEEPER && (
									<div className="form-control">
										<label htmlFor="shopName">Shop Name</label>
										<Field type="text" id="shopName" name="shopName" />
										<ErrorMessage name="shopName" component={ErrorText} />
									</div>
								)}

								<button
									type="submit"
									disabled={
										!formik.dirty ||
										!formik.isValid ||
										formik.isSubmitting ||
										(formik.values.role === ROLE.WORKER && !profilePicture) ||
										(formik.values.role !== ROLE.USER && !proofs.length)
									}
									className="btn btn-success mt-10"
								>
									Register
								</button>
							</Form>
						);
					}}
				</Formik>
			</div>
			<Footer></Footer>
		</>
	);
}

export default Register;
