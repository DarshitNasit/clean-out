const ServiceCategoryModel = require("../models/ServiceCategory");
const handleError = require("../utilities/errorHandler");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const getServiceCategories = async (req, res) => {
	try {
		const categories = await ServiceCategoryModel.find();
		const message = "Found service categories";
		res.json(new Response(RESPONSE.SUCCESS, { message, categories }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = { getServiceCategories };
