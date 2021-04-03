import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import ErrorText from "./ErrorText";
import { ROLE, RESPONSE } from "../enums";
import { Axios } from "../utilities";

const initialValues = {
	serviceName: "",
	serviceCategory: "Bathroom Cleaning",
	subCategory: [],
	description: "",
};

const onSubmit = async (values, setError, history, user) => {
	setError(null);
	values = {
		...values,
		subCategory: values.subCategory
			.filter((value) => !!value)
			.map((value) => ({ ...value, name: value.name[0] })),
	};
	if (!values.subCategory || !values.subCategory.length) {
		setError("Choose at least one sub category");
		return;
	}
	values.subCategory.forEach((value) => {
		if (value.price === "" || value.price === null) {
			setError(`${value.name} must have valid price`);
			return;
		}
	});

	const res = await Axios.POST(`/service/${user._id}`, values);
	const data = res.data;

	if (res.success === RESPONSE.FAILURE) {
		setError(data.message);
	} else {
		history.push("/");
	}
};

const validationSchema = Yup.object({
	serviceName: Yup.string().required("Required"),
	serviceCategory: Yup.string().required("Required"),
	description: Yup.string().required("Required"),
});

function AddService(props) {
	const { history, auth } = props;
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [error, setError] = useState(null);
	useEffect(() => {
		getUser();
		async function getUser() {
			const res = await Axios.GET("/user/auth");
			const data = res.data;
			if (data.user) {
				if (data.user.role === ROLE.SHOPKEEPER) {
					setUser(data.user);
					getCategories();
				} else if (data.user.role === ROLE.WORKER) {
					const resW = await Axios.GET(`/worker/workerOnly/${data.user._id}`);
					if (resW.data.worker.isDependent === "true") history.push("/");
					else {
						setUser(data.user);
						getCategories();
					}
				} else history.push("/");
			} else history.push("/login");
		}
		async function getCategories() {
			const res = await Axios.GET("/serviceCategory");
			setCategories(res.data.categories);
			initialValues.serviceCategory = res.data.categories[0].category;
			setLoading(false);
		}
	}, [history]);

	return (
		!loading && (
			<>
				<div className="card_container">
					<h2 className="mt-20 mb-10">Add Service</h2>
					{error ? <ErrorText>{error}</ErrorText> : null}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) => onSubmit(values, setError, history, user)}
					>
						{(formik) => {
							return (
								<Form className="card mb-50">
									<div className="form-control">
										<label htmlFor="serviceName">Service Name</label>
										<Field type="text" id="serviceName" name="serviceName" />
										<ErrorMessage name="serviceName" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="description">Description</label>
										<Field
											as="textarea"
											id="description"
											name="description"
											rows="5"
										/>
										<ErrorMessage name="description" component={ErrorText} />
									</div>

									<div className="form-control">
										<label htmlFor="serviceCategory">For:</label>
										<Field
											className="role_select"
											as="select"
											name="serviceCategory"
											id="serviceCategory"
										>
											{categories.map((category) => (
												<option
													key={category._id}
													value={category.category}
												>
													{category.category}
												</option>
											))}
										</Field>
									</div>

									<FieldArray name="subCategory">
										{(fieldArrayProps) => {
											const { serviceCategory } = fieldArrayProps.form.values;
											const categoriesOne = categories.find(
												(category) => category.category === serviceCategory
											);
											console.log(formik.values.subCategory);
											return (
												<div className="sub_category_input">
													{categoriesOne?.subCategory.map(
														(subCategory, index) => {
															return (
																<div
																	key={index}
																	className="sub_category_input_field"
																>
																	<Field
																		type="checkbox"
																		name={`subCategory[${index}].name`}
																		value={subCategory.name}
																	></Field>
																	<label>
																		{subCategory.name}
																	</label>
																	{formik.values.subCategory[
																		index
																	]?.name?.length > 0 && (
																		<>
																			<Field
																				type="text"
																				name={`subCategory[${index}].price`}
																			></Field>
																			<label>Price</label>
																			{subCategory.area && (
																				<>
																					<Field
																						type="text"
																						name={`subCategory[${index}].mxSqFt`}
																					></Field>
																					<label>
																						Max SqFt
																					</label>
																				</>
																			)}
																		</>
																	)}
																</div>
															);
														}
													)}
												</div>
											);
										}}
									</FieldArray>

									<button
										type="submit"
										className="btn btn-success mt-10"
										disabled={
											!formik.dirty || !formik.isValid || formik.isSubmitting
										}
									>
										{formik.isSubmitting ? "Adding Service" : "Add Service"}
									</button>
								</Form>
							);
						}}
					</Formik>
				</div>
			</>
		)
	);
}

function mapStateToProps(state) {
	return {
		auth: state.auth,
		home: state.home,
		error: state.error,
	};
}

export default connect(mapStateToProps)(AddService);
