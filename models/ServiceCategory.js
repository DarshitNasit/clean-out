const mongoose = require("mongoose");

const ServiceCategorySchema = mongoose.Schema(
	{
		category: { type: String, required: true },
		subCategory: {
			type: [
				{
					name: { type: String, required: true },
					area: { type: Boolean, default: false },
				},
			],
			required: true,
		},
		image: { type: String, required: true },
	},
	{ versionKey: false }
);

module.exports = mongoose.model("ServiceCategory", ServiceCategorySchema, "ServiceCategory");
