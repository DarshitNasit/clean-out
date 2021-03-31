const mongoose = require("mongoose");
const SERVICE_CATEGORY = require("./Enums/SERVICE_CATEGORY");

const ServiceSchema = mongoose.Schema(
	{
		// service id
		serviceProviderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		serviceName: { type: String, required: true },
		serviceCategory: { type: SERVICE_CATEGORY, required: true },
		subCategory: { type: mongoose.Schema.Types.Array, required: true },
		description: { type: String, default: "" },
	},
	{ versionKey: false }
);

const ServiceModel = mongoose.model("Service", ServiceSchema, "Service");
ServiceModel.ensureIndexes().catch((error) => console.log(error));

module.exports = ServiceModel;
