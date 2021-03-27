import React, { useState, useCallback, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useHistory } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ErrorText from "./ErrorText";
import ImageInput from "./ImageInput";
import RESPONSE from "../enums/RESPONSE";
import Axios from "../utilities/Axios";
import { buildFormData } from "../utilities/FormData";

const initialValues = { itemName: "", price: "", description: "" };

const onSubmit = async (values, setError, history, itemImage) => {
	setError(null);
	if (itemImage.itemImage === null || itemImage.itemImage === "") {
		return itemImage.setItemImageError("Required");
	}

	const { formData, headers } = buildFormData({ ...values, itemImage: itemImage.itemImage });
	const res = await Axios.POST("/item/605f9ce86876862b1c1db6fb", formData, headers);
	const data = res.data;

	if (res.success === RESPONSE.FAILURE) {
		setError(data.message);
	} else {
		history.push("/");
	}
};

const validationSchema = Yup.object({
	itemName: Yup.string().required("Required"),
	price: Yup.number().typeError("Must be a number").required("Required"),
	description: Yup.string().required("Required"),
});

function AddItem() {
	const [error, setError] = useState(null);
	const history = useHistory();

	const [itemImage, setItemImage] = useState("");
	const [itemImageError, setItemImageError] = useState(null);

	/**
	 * Find somehow shopkeeper Id
	 */

	useEffect(() => {
		if (itemImage != null) setItemImageError(null);
		else setItemImageError("Required");
	}, [itemImage]);

	const onFileUpload = useCallback((name, files) => {
		setItemImageError(null);
		setItemImage(files.length ? files[0] : null);
	}, []);

	return (
		<>
			<Header></Header>
			<div className="card_container">
				<h2 className="mb-10">Add Cleaning Product</h2>
				{error ? <ErrorText>{error}</ErrorText> : null}
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={(values) =>
						onSubmit(values, setError, history, { itemImage, setItemImageError })
					}
				>
					{(formik) => {
						return (
							<Form className="card">
								<div className="form-control">
									<label htmlFor="itemName">Item Name</label>
									<Field type="text" id="itemName" name="itemName" />
									<ErrorMessage name="itemName" component={ErrorText} />
								</div>

								<div className="form-control">
									<label htmlFor="price">Price</label>
									<Field type="text" id="price" name="price" />
									<ErrorMessage name="price" component={ErrorText} />
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
									<label htmlFor="itemImage">Item Image</label>
									<ImageInput name="itemImage" onFileUpload={onFileUpload} />
									{itemImageError && <ErrorText>{itemImageError}</ErrorText>}
								</div>

								<button type="submit" className="btn btn-success mt-10">
									Add Item
								</button>
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
