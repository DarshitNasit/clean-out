const mongoose = require("mongoose");

const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ShopkeeperModel = require("../models/Shopkeeper");
const Response = require("../models/Response");
const ItemModel = require("../models/Item");
const ServiceModel = require("../models/Service");
const WorkerModel = require("../models/Worker");
const WorkerServiceModel = require("../models/WorkerService");
const OrderItemPackModel = require("../models/OrderItemPack");
const ServiceOrderModel = require("../models/ServiceOrder");
const RESPONSE = require("../models/Enums/RESPONSE");
const { getOrders } = require("../controllers/UserController");

const bcrypt = require("bcryptjs");
const encrypt = require("../utilities/encrypt");
const handleError = require("../utilities/errorHandler");
const { deleteFiles, useSharp } = require("../utilities/FileHandlers");

const getOnlyShopkeeperById = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const shopkeeper = await ShopkeeperModel.findById(shopkeeperId);
		if (!shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Shopkeeper found";
		res.json(new Response(RESPONSE.SUCCESS, { message, shopkeeper }));
	} catch (error) {
		handleError(error);
	}
};

const getShopkeeperById = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const [shopkeeperUser, address, shopkeeper] = await Promise.all([
			UserModel.findById(shopkeeperId),
			AddressModel.findById(shopkeeperId),
			ShopkeeperModel.findById(shopkeeperId),
		]);
		if (!shopkeeperUser || !shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const { serviceOrders, itemOrders } = getOrders(shopkeeperId);
		const message = "Found shopkeeper";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				shopkeeperUser,
				address,
				shopkeeper,
				serviceOrders,
				itemOrders,
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const getShopkeeperByPhone = async (req, res) => {
	try {
		const phone = req.body.phone;
		const shopkeeperUser = await UserModel.findOne({ phone });
		const [address, shopkeeper] = await Promise.all([
			AddressModel.findById(shopkeeperUser._id),
			ShopkeeperModel.findById(shopkeeperUser._id),
		]);
		if (!shopkeeperUser || !shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found shopkeeper";
		res.json(new Response(RESPONSE.SUCCESS, { message, shopkeeperUser, address, shopkeeper }));
	} catch (error) {
		handleError(error);
	}
};

const getWorkers = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const lastKey = req.body.lastKey || "";
		const ObjectId = mongoose.Types.ObjectId;

		const query = { shopkeeperId: ObjectId(shopkeeperId) };
		if (lastKey != "") query._id = { $gt: ObjectId(lastKey) };
		const workers = await WorkerModel.aggregate([
			{ $match: query },
			{ $limit: Number(process.env.LIMIT_WORKERS) },
			{
				$lookup: {
					from: "User",
					localField: "_id",
					foreignField: "_id",
					as: "workerUser",
				},
			},
			{ $unwind: "$workerUser" },
			{
				$project: {
					workerUser: {
						userName: "$workerUser.userName",
						phone: "$workerUser.phone",
						role: "$workerUser.role",
					},
					worker: {
						shopkeeperId: "$shopkeeperId",
						profilePicture: "$profilePicture",
						proofs: "$proofs",
					},
				},
			},
		]);

		const message = "Found workers";
		res.json(new Response(RESPONSE.SUCCESS, { message, workers }));
	} catch (error) {
		handleError(error);
	}
};

const getRequestedOrders = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const lastKeyItemOrder = req.body.lastKeyItemOrder || "";
		const lastKeyServiceOrder = req.body.lastKeyServiceOrder || "";
		const ObjectId = mongoose.Types.ObjectId;

		const shopkeeperUser = await UserModel.findById(shopkeeperId);
		if (!shopkeeperUser) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		let query = { shopkeeperId: ObjectId(shopkeeperId) };
		if (lastKeyItemOrder != "") query._id = { $gt: ObjectId(lastKeyItemOrder) };
		const itemOrders = await OrderItemPackModel.aggregate([
			{ $match: query },
			{ $group: { _id: "$orderId", subOrders: { $push: "$$ROOT" } } },
			{
				$lookup: {
					from: "ItemOrder",
					localField: "_id",
					foreignField: "_id",
					as: "ItemOrder",
				},
			},
			{ $unwind: "$ItemOrder" },
			{ $limit: Number(process.env.LIMIT_ORDERS) },
			{
				$lookup: {
					from: "User",
					localField: "ItemOrder.userId",
					foreignField: "_id",
					as: "User",
				},
			},
			{ $unwind: "$User" },
			{
				$lookup: {
					from: "Address",
					localField: "_id",
					foreignField: "_id",
					as: "Address",
				},
			},
			{ $unwind: "$Address" },
			{ $sort: { "$ItemOrder.placedDate": -1 } },
		]);

		query = { shopkeeperId: ObjectId(shopkeeperId) };
		if (lastKeyServiceOrder != "") query._id = { $gt: ObjectId(lastKeyServiceOrder) };
		const serviceOrders = await ServiceOrderModel.aggregate([
			{ $match: query },
			{ $limit: Number(process.env.LIMIT_ORDERS) },
			{
				$lookup: {
					from: "User",
					localField: "userId",
					foreignField: "_id",
					as: "User",
				},
			},
			{ $unwind: "$User" },
			{
				$lookup: {
					from: "Address",
					localField: "userId",
					foreignField: "_id",
					as: "Address",
				},
			},
			{ $unwind: "$Address" },
			{ $sort: { placedDate: -1 } },
		]);

		const message = "Found orders";
		res.json(new Response(RESPONSE.SUCCESS, { message, itemOrders, serviceOrders }));
	} catch (error) {
		handleError(error);
	}
};

const registerShopkeeper = async (req, res) => {
	try {
		const { userName, phone, role } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const { shopName } = req.body;
		const password = await encrypt(req.body.password);
		const files = req.files;
		const proofs = [files.proofs[0].filename];
		if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);

		const user = await UserModel.findOne({ phone });
		if (user) {
			await deleteFiles(proofs, "tempUploads");
			const message = "Registered phone number already";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const _id = mongoose.Types.ObjectId();
		const shopkeeperUser = new UserModel({ _id, userName, phone, password, role });
		const address = new AddressModel({ _id, society, area, pincode, city, state });
		const shopkeeper = new ShopkeeperModel({ _id, shopName, proofs });
		await Promise.all([
			shopkeeperUser.save(),
			address.save(),
			shopkeeper.save(),
			useSharp(proofs),
		]);

		const message = "Registered shopkeeper";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: _id }));
	} catch (error) {
		handleError(error);
	}
};

const updateShopkeeper = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const { userName, phone, password, newPassword } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const { shopName } = req.body;
		const files = req.files;
		const proofs = [];

		if (files.proofs) {
			proofs.push(files.proofs[0].filename);
			if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);
		}

		const [shopkeeperUser, shopkeeper] = await Promise.all([
			UserModel.findById(shopkeeperId),
			ShopkeeperModel.findById(shopkeeperId),
		]);
		if (!shopkeeperUser || !shopkeeper) {
			if (files.proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const isMatch = await bcrypt.compare(password, shopkeeperUser.password);
		if (!isMatch) {
			if (files.proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Incorrect password";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		shopkeeperUser.userName = userName;
		shopkeeperUser.phone = phone;
		if (newPassword) shopkeeperUser.password = await encrypt(newPassword);
		shopkeeper.shopName = shopName;

		if (files.proofs) {
			await Promise.all([useSharp(proofs), deleteFiles(shopkeeper.proofs)]);
			shopkeeper.proofs = proofs;
		}

		shopkeeper.isVerified = false;
		await Promise.all([
			shopkeeperUser.save(),
			AddressModel.findByIdAndUpdate(shopkeeperId, { society, area, pincode, city, state }),
			shopkeeper.save(),
		]);

		const message = "Updated shopkeeper";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const removeShopkeeper = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const [shopkeeperUser, shopkeeper] = await Promise.all([
			UserModel.findById(shopkeeperId),
			ShopkeeperModel.findById(shopkeeperId),
		]);
		if (!shopkeeperUser || !shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const workers = await WorkerModel.find({ shopkeeperId });

		await Promise.all([
			shopkeeper.delete(),
			shopkeeperUser.delete(),
			AddressModel.findByIdAndDelete(shopkeeperId),
			deleteFiles(shopkeeper.proofs),
			ItemModel.deleteMany({ shopkeeperId }),
			ServiceModel.deleteMany({ serviceProviderId: shopkeeperId }),
			workers.map((worker) => {
				worker.shopkeeperId = null;
				worker.isDependent = "false";
				return Promise.all([
					worker.save(),
					WorkerServiceModel.deleteMany({ workerId: worker._id }),
				]);
			}),
		]);

		const message = "Deleted shopkeeper";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getOnlyShopkeeperById,
	getShopkeeperById,
	getShopkeeperByPhone,
	getWorkers,
	getRequestedOrders,
	registerShopkeeper,
	updateShopkeeper,
	removeShopkeeper,
};
