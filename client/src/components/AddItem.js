import React, { useState } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useHistory } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ErrorText from "./ErrorText";
import RESPONSE from "../enums/RESPONSE";
import Axios from "../utilities/Axios";

const initialValues = { itemName: "", price: 0, description: "" };

const onSubmit = async (values, setError, history) => {};

const validationSchema = Yup.object({
	itemName: Yup.string().required("Required"),
	price: Yup.number().required("Required"),
	description: Yup.string().required("Required"),
});

function AddItem() {
	const [error, setError] = useState(null);
	const history = useHistory();

	return (
		<>
			<Header></Header>
			<div className="card_container">
				<h2 className="mb-10">Sign in to Clean Out</h2>
				{error ? <ErrorText>{error}</ErrorText> : null}
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={(values) => onSubmit(values, setError, history)}
				>
					{(formik) => {
						return (
							<Form className="card">
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
								<br />
								<div className="buttons">
									<button
										type="submit"
										disabled={
											!(formik.dirty && formik.isValid) || formik.isSubmitting
										}
										className="btn btn-success mr-10"
									>
										Sign In
									</button>
									<button className="btn btn-danger">Forgot Password</button>
								</div>
							</Form>
						);
					}}
				</Formik>
				<p className="big-font-size mt-10 mb-10">
					New to Clean Out ? <Link to="/register">Register</Link>
				</p>
			</div>
			<Footer></Footer>
		</>
	);
}

export default AddItem;
