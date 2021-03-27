const UserModel = require("../models/User");
const RatingModel = require("../models/Rating");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const handleError = require("../utilities/errorHandler");

const getRatingById = async (req, res) => {
	try {
		const ratingId = req.params.ratingId;
		const rating = await RatingModel.findById(ratingId);
		if (!rating) {
			const message = "Rating not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found rating";
		res.json(new Response(RESPONSE.SUCCESS, { message, rating }));
	} catch (error) {
		handleError(error);
	}
};

const addRating = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const rating = new RatingModel();
		rating.userId = userId;
		rating.targetId = req.body.targetId;
		rating.ratingValue = req.body.ratingValue;
		rating.description = req.body.description;
		await rating.save();

		const message = "Added rating";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: rating._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateRating = async (req, res) => {
	try {
		const ratingId = req.params.ratingId;
		const rating = await RatingModel.findById(ratingId);
		if (!rating) {
			const message = "Rating not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		rating.ratingValue = req.body.ratingValue;
		rating.description = req.body.description;
		await rating.save();

		const message = "Updated rating";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const deleteRating = async (req, res) => {
	try {
		const ratingId = req.params.ratingId;
		const rating = await RatingModel.findById(ratingId);
		if (!rating) {
			const message = "Rating not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await rating.delete();
		const message = "Deleted rating";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getRatingById,
	addRating,
	updateRating,
	deleteRating,
};
