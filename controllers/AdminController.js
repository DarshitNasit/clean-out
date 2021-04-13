const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ShopkeeperModel = require("../models/Shopkeeper");
const ItemModel = require("../models/Item");
const ServiceModel = require("../models/Service");
const WorkerModel = require("../models/Worker");
const WorkerServiceModel = require("../models/WorkerService");
const OrderItemPackModel = require("../models/OrderItemPack");
const ItemOrderModel = require("../models/ItemOrder");
const ServiceOrderModel = require("../models/ServiceOrder");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const handleError = require("../utilities/errorHandler");
const ROLE = require("../models/Enums/ROLE");

module.exports = { getInitialData, getUsers };

async function getInitialData(req, res) {
	try {
		const [
			totalUsers,
			totalWorkers,
			totalShopkeepers,
			totalItemOrders,
			totalServiceOrders,
		] = await Promise.all([
			UserModel.find().countDocuments(),
			WorkerModel.find().countDocuments(),
			ShopkeeperModel.find().countDocuments(),
			ItemOrderModel.find().countDocuments(),
			ServiceOrderModel.find().countDocuments(),
		]);

		const message = "Found counts";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				totalUsers,
				totalWorkers,
				totalShopkeepers,
				totalItemOrders,
				totalServiceOrders,
			})
		);
	} catch (error) {
		handleError(error);
	}
}

async function getUsers(req, res) {
	try {
		const { page, search, searchBy, searchFor, verification } = req.query;
		let users, totalItems;

		const workerObj = {
			$lookup: {
				from: "Worker",
				localField: "_id",
				foreignField: "_id",
				as: "worker",
			},
		};

		const shopkeeperObj = {
			$lookup: {
				from: "Shopkeeper",
				localField: "_id",
				foreignField: "_id",
				as: "shopkeeper",
			},
		};

		const workerVerificationObj = {
			$match: { "worker.isVerified": verification === "verified" ? true : false },
		};

		const shopkeeperVerificationObj = {
			$match: { "shopkeeper.isVerified": verification === "verified" ? true : false },
		};

		const countObj = { $count: "totalItems" };

		if (searchBy === "phone") {
			const pipeline = [{ $match: { phone: search } }];
			const pipelineCount = [...pipeline];

			pipeline.push(
				{ $skip: Number(process.env.LIMIT_ADMIN) * (page - 1) },
				{ $limit: Number(process.env.LIMIT_ADMIN) },
				{
					$lookup: {
						from: "Address",
						localField: "_id",
						foreignField: "_id",
						as: "address",
					},
				},
				{ $unwind: "$address" }
			);

			if (searchFor === "worker") {
				pipeline[0].$match.role = ROLE.WORKER;
				pipelineCount[0].$match.role = ROLE.WORKER;

				if (verification === "any") {
					pipeline.push(workerObj, { $unwind: "$worker" });
				} else {
					pipeline.splice(1, 0, workerObj, { $unwind: "$worker" });
					pipeline.splice(2, 0, workerVerificationObj);
					pipelineCount.push(workerObj, { $unwind: "$worker" }, workerVerificationObj);
				}

				pipeline.push(
					{
						$lookup: {
							from: "Shopkeeper",
							localField: "worker.shopkeeperId",
							foreignField: "_id",
							as: "shopkeeper",
						},
					},
					{
						$unwind: {
							path: "$shopkeeper",
							preserveNullAndEmptyArrays: true,
						},
					}
				);
			} else if (searchFor === "shopkeeper") {
				pipeline[0].$match.role = ROLE.SHOPKEEPER;
				pipelineCount[0].$match.role = ROLE.SHOPKEEPER;

				if (verification === "any") {
					pipeline.push(shopkeeperObj, { $unwind: "$shopkeeper" });
				} else {
					pipeline.splice(1, 0, shopkeeperObj, { $unwind: "$shopkeeper" });
					pipeline.splice(2, 0, shopkeeperVerificationObj);
					pipelineCount.push(
						shopkeeperObj,
						{ $unwind: "$shopkeeper" },
						shopkeeperVerificationObj
					);
				}
			}

			pipeline.push({
				$project: {
					user: {
						_id: "$_id",
						userName: "$userName",
						role: "$role",
						phone: "$phone",
					},
					address: 1,
					worker: 1,
					shopkeeper: 1,
				},
			});

			pipelineCount.push(countObj);
			[users, totalItems] = await Promise.all([
				UserModel.aggregate(pipeline),
				UserModel.aggregate(pipelineCount),
			]);
		} else if (searchBy === "pincode") {
			const pipeline = [{ $match: { pincode: search } }];

			pipeline.push(
				{ $skip: Number(process.env.LIMIT_ADMIN) * (page - 1) },
				{ $limit: Number(process.env.LIMIT_ADMIN) },
				{
					$lookup: {
						from: "User",
						localField: "_id",
						foreignField: "_id",
						as: "user",
					},
				},
				{ $unwind: "$user" }
			);

			const pipelineCount = [...pipeline];
			if (searchFor === "worker") {
				pipeline.push({ $match: { "user.role": ROLE.WORKER } });
				pipelineCount.push({ $match: { "user.role": ROLE.WORKER } });

				if (verification === "any") {
					pipeline.push(workerObj, { $unwind: "$worker" });
				} else {
					pipeline.splice(1, 0, workerObj, { $unwind: "$worker" });
					pipeline.splice(2, 0, workerVerificationObj);
					pipelineCount.push(workerObj, { $unwind: "$worker" }, workerVerificationObj);
				}

				pipeline.push(
					{
						$lookup: {
							from: "Shopkeeper",
							localField: "worker.shopkeeperId",
							foreignField: "_id",
							as: "shopkeeper",
						},
					},
					{
						$unwind: {
							path: "$shopkeeper",
							preserveNullAndEmptyArrays: true,
						},
					}
				);
			} else if (searchFor === "shopkeeper") {
				pipeline.push({ $match: { "user.role": ROLE.SHOPKEEPER } });
				pipelineCount.push({ $match: { "user.role": ROLE.SHOPKEEPER } });

				if (verification === "any") {
					pipeline.push(shopkeeperObj, { $unwind: "$shopkeeper" });
				} else {
					pipeline.splice(1, 0, shopkeeperObj, { $unwind: "$shopkeeper" });
					pipeline.splice(2, 0, shopkeeperVerificationObj);
					pipelineCount.push(
						shopkeeperObj,
						{ $unwind: "$shopkeeper" },
						shopkeeperVerificationObj
					);
				}
			}

			pipeline.push({
				$project: {
					address: {
						_id: "$_id",
						society: "$society",
						area: "$area",
						city: "$city",
						state: "$state",
						pincode: "$pincode",
					},
					user: 1,
					worker: 1,
					shopkeeper: 1,
				},
			});

			pipelineCount.push(countObj);
			[users, totalItems] = await Promise.all([
				AddressModel.aggregate(pipeline),
				AddressModel.aggregate(pipelineCount),
			]);
		}

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Found users";
		res.json(new Response(RESPONSE.SUCCESS, { message, users, totalItems }));
	} catch (error) {
		handleError(error);
	}
}
