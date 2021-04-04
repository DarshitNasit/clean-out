import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";

import ErrorText from "./ErrorText";
import { RESPONSE } from "../enums";
import { Axios, isEmptyObject } from "../utilities";
import { setError, getDataForHome } from "../redux/actions";

const initialValues = {
	serviceName: "",
	serviceCategory: "",
	subCategory: [],
	description: "",
};

const onSubmit = async (values, setError, history, serviceId, home) => {
	setError("");
	console.log(values);
	values = {
		...values,
		subCategory: values.subCategory
			.filter((value) => {
				if (!value || isEmptyObject(value) || !value.name.length) return false;
				return true;
			})
			.map((value) => ({ ...value, name: value.name[0] })),
	};

	if (!values.subCategory || !values.subCategory.length)
		return setError("Choose at least one sub category");

	const category = values.serviceCategory;
	const subCategory = home.serviceCategories.filter((value) => value.category === category)[0]
		.subCategory;

	for (let i = 0; i < values.subCategory.length; i++) {
		const value = values.subCategory[i];
		if (!value.price || Number(value.price) <= 0)
			return setError(`${value.name} must have valid price`);
		for (let j = 0; j < subCategory.length; j++) {
			if (
				subCategory[j].name === value.name &&
				subCategory[j].area &&
				(!value.mxSqFt || Number(value.mxSqFt) <= 0)
			)
				return setError(`${value.name} must have valid square feet size`);
		}
	}

	const res = await Axios.PUT(`/service/${serviceId}`, values);
	if (res.success === RESPONSE.FAILURE) setError(res.data.message);
	else history.push(`/viewService/${serviceId}`);
};

const validationSchema = Yup.object({
	serviceName: Yup.string().required("Required"),
	serviceCategory: Yup.string().required("Required"),
	description: Yup.string().required("Required"),
});

function UpdateService(props) {
	const { history, match, auth, error, home } = props;
	const { setError, getDataForHome } = props;

	const serviceId = match.params?.serviceId;
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUser();
		async function getUser() {
			if (!serviceId) history.goBack();
			else if (!auth.isAuthenticated) history.push("/login");
			else {
				const res = await Axios.GET(`/service/${serviceId}`);
				if (res.success === RESPONSE.FAILURE) setError(res.data.message);
				else {
					const service = res.data.service;
					if (service.serviceProviderId !== auth.user._id) history.goBack();
					else {
						initialValues.serviceName = service.serviceName;
						initialValues.serviceCategory = service.serviceCategory;
						initialValues.subCategory = service.subCategory;
						initialValues.description = service.description;
						if (!home.isLoaded) getDataForHome(history);
						else {
							console.log("main");
							formatSubCategory();
						}
					}
				}
			}
		}
	}, []);

	useEffect(() => {
		if (home.isLoaded) {
			console.log("second");
			formatSubCategory();
		}
	}, [home]);

	function formatSubCategory() {
		const values = initialValues.subCategory;
		const subCategory = home.serviceCategories.filter(
			(value) => value.category === initialValues.serviceCategory
		)[0].subCategory;

		initialValues.subCategory = subCategory.map((category) => {
			for (let i = 0; i < values.length; i++)
				if (values[i].name === category.name)
					return { ...values[i], name: [values[i].name] };
			return {};
		});
		setLoading(false);
	}

	return (
		!loading && (
			<>
				<div className="card_container">
					<h2 className="mt-20 mb-10">Add Service</h2>
					{error.error ? <ErrorText>{error.error}</ErrorText> : null}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) => onSubmit(values, setError, history, serviceId, home)}
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
											onChange={(event) => {
												formik.setValues((prev) => ({
													...prev,
													subCategory: [],
												}));
												formik.handleChange(event);
											}}
										>
											{home.serviceCategories.map((category) => (
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
											const categoriesOne = home.serviceCategories.find(
												(category) => category.category === serviceCategory
											);
											return (
												<div className="sub_category_input">
													{categoriesOne?.subCategory.map(
														(subCategory, index) => {
															const isChecked = formik.values
																.subCategory[index]?.name?.length
																? true
																: false;
															return (
																<div
																	key={index}
																	className="sub_category_input_field"
																>
																	<Field
																		type="checkbox"
																		name={`subCategory[${index}].name`}
																		value={subCategory.name}
																		id={`subCategory[${index}].name`}
																		checked={isChecked}
																	></Field>
																	<label
																		className="hover-pointer"
																		htmlFor={`subCategory[${index}].name`}
																	>
																		{subCategory.name}
																	</label>
																	{formik.values.subCategory[
																		index
																	]?.name?.length > 0 && (
																		<>
																			<Field
																				type="number"
																				name={`subCategory[${index}].price`}
																			></Field>
																			<label>Price</label>
																			{subCategory.area && (
																				<>
																					<Field
																						type="number"
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
										{formik.isSubmitting
											? "Updating Service"
											: "Update Service"}
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

function mapDispatchToProps(dispatch) {
	return {
		setError: (error) => dispatch(setError(error)),
		getDataForHome: (history) => getDataForHome(history)(dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateService);
