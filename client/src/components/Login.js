import React, { useState } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useHistory } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ErrorText from "./ErrorText";
import RESPONSE from "../enums/RESPONSE";
import Axios from "../utilities/Axios";

const initialValues = {
	phone: "",
	password: "",
};

const onSubmit = async (data, setError, history) => {
	setError(null);

	const res = await Axios.POST("/auth/login", data);
	data = res.data;

	if (res.success === RESPONSE.FAILURE) {
		setError(data.message);
	} else {
		history.push("/home");
	}
};

const validationSchema = Yup.object({
	phone: Yup.string().required("Required"),
	// .matches(/^[0-9]+$/, "Must be only digits")
	// .length(10, "Must be 10 digits"),
	password: Yup.string().required("Required"),
});

function Login() {
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

export default Login;
