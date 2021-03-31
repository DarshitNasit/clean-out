import React, { useState, useCallback, useEffect } from "react";
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

const initialValues = { itemName: "", price: "", description: "" };

const onSubmit = async (values, setError, history, user, itemImage) => {
	setError(null);
	if (itemImage.itemImage === null || itemImage.itemImage === "") {
		return itemImage.setItemImageError("Required");
	}

	console.log(user);
	const { formData, headers } = buildFormData({ ...values, itemImage: itemImage.itemImage });
	const res = await Axios.POST(`/item/${user._id}`, formData, headers);
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
	const history = useHistory();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		async function getUser() {
			const res = await Axios.GET("/user/auth");
			const data = res.data;
			if (data.user) {
				if (data.user.role === ROLE.SHOPKEEPER) {
					setUser(data.user);
					setLoading(false);
				} else history.push("/");
			} else history.push("/login");
		}
		getUser();
	}, [history]);

	const [error, setError] = useState(null);
	const [itemImage, setItemImage] = useState("");
	const [itemImageError, setItemImageError] = useState(null);

	useEffect(() => {
		if (itemImage != null) setItemImageError(null);
		else setItemImageError("Required");
	}, [itemImage]);

	const onFileUpload = useCallback((name, files) => {
		setItemImageError(null);
		setItemImage(files.length ? files[0] : null);
	}, []);

	return (
		!loading && (
			<>
				<Header></Header>
				<div className="card_container">
					<h2 className="mb-10">Add Cleaning Product</h2>
					{error ? <ErrorText>{error}</ErrorText> : null}
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values) =>
							onSubmit(values, setError, history, user, {
								itemImage,
								setItemImageError,
							})
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
				</div>
				<Footer></Footer>
			</>
		)
	);
}

export default AddItem;
