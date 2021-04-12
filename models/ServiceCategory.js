const mongoose = require("mongoose");

const ServiceCategorySchema = mongoose.Schema(
	{
		category: { type: String, required: true },
		subCategories: [
			{
				_id: false,
				name: { type: String, required: true },
				area: { type: Boolean, default: false },
			},
		],
		image: { type: String, required: true },
	},
	{ versionKey: false }
);

module.exports = mongoose.model("ServiceCategory", ServiceCategorySchema, "ServiceCategory");
