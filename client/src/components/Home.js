import React, { useEffect } from "react";
import { connect } from "react-redux";

import ErrorText from "./ErrorText";
import { getDataForHome } from "../redux/actions";

const cleaningCategory = (history, category, categories) => {
	console.log("inside");
	history.push("/cleaningCategory", { category, categories });
};

const items = (history) => {
	console.log("inside");
};

function Home(props) {
	const { history, auth, home, error } = props;
	const { getDataForHome } = props;

	useEffect(() => {
		if (!home.isLoaded) getDataForHome(history);
	}, [history]);

	return (
		!auth.loading &&
		!home.loading && (
			<>
				<div className="App">
					{error.error && <ErrorText>{error.error}</ErrorText>}
					<div className="home_container">
						<img className="home_image" src={"/images/Home.jpg"} alt="Home" />
						<div>
							<span className="first_row">Clean Out</span>
							<span className="sec_row">
								You know what would make house cleaning more fun? A servant
							</span>
						</div>
					</div>
					<div className="btn-main">
						<p className="hugh-font-size mt-20 ml-50">Cleaning Categories</p>
						<div className="cleaning_card_container">
							{home.serviceCategories.map((category) => (
								<div
									key={category._id}
									className="category_card"
									onClick={() => cleaningCategory(history)}
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
							{home.items.map((item) => (
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

export default connect(mapStateToProps, { getDataForHome })(Home);
