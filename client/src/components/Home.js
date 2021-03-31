import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import Axios from "../utilities/Axios";

const cleaningCategory = (history, category, categories) => {
	console.log("inside");
	history.push("/cleaningCategory", { category, categories });
};

function Home() {
	const history = useHistory();
	const [items, setItems] = useState(null);
	const [categories, setCategories] = useState(null);
	useEffect(() => {
		getCategories();
		getItems();

		async function getCategories() {
			const res = await Axios.GET("/serviceCategory");
			setCategories(res.data.categories);
		}
		async function getItems() {
			const res = await Axios.GET("/item/random");
			setItems(res.data.items);
		}
	}, []);

	return (
		<>
			<Header></Header>
			<div className="App">
				<div className="home_container">
					<img className="home_image" src={"/images/Home.jpg"} alt="Home" />
					<div>
						<span className="first_row">Clean Out</span>
						<span className="sec_row">
							You know what would make house cleaning more fun? A servent
						</span>
					</div>
				</div>
				<div className="btn-main">
					<p className="hugh-font-size mt-20 ml-50">Cleaning Categories</p>
					<div className="cleaning_card_container">
						{categories &&
							categories.map((category) => (
								<div
									key={category._id}
									className="category_card"
									onClick={() =>
										cleaningCategory(history, category.category, categories)
									}
								>
									<img
										src={`/images/${category.image}`}
										width="300"
										height="250"
										alt={category.image}
									></img>
									<span>{category.category}</span>
								</div>
							))}
					</div>
				</div>

				<div className="white btn-violet">
					<p className="hugh-font-size mt-20 ml-50">Cleaning Products</p>
					<div className="cleaning_card_container">
						{items?.map((item) => (
							<div
								key={item._id}
								className="category_card"
								onClick={() => items(history)}
							>
								<img
									src={`/images/${item.itemImage}`}
									width="300"
									height="250"
									alt={item.itemImage}
								></img>
								<span>{item.itemName}</span>
							</div>
						))}
					</div>
				</div>
			</div>
			<Footer></Footer>
		</>
	);
}

export default Home;
