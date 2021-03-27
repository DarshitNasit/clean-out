const bcrypt = require("bcryptjs");

const WorkerModel = require("../models/Worker");
const LocationModel = require("../models/Location");
const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const mongoose = require("mongoose");
const ServiceModel = require("../models/Service");
const ServiceOrderModel = require("../models/ServiceOrder");
const WorkerServiceModel = require("../models/WorkerService");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const { getOrders } = require("./UserController");

const encrypt = require("../utilities/encrypt");
const handleError = require("../utilities/errorHandler");
const { stringToArray } = require("../utilities/formatter");
const { deleteFiles, useSharp } = require("../utilities/FileHandlers");

const getWorkerWithShopkeeperById = async (workerId) => {
	try {
		const workerUser = await UserModel.findById(workerId);
		if (!workerUser) {
			const message = "Worker not found";
			return { info: new Response(RESPONSE.FAILURE, { message }) };
		}

		const worker = await WorkerModel.findById(workerId);
		if (worker.isDependent == "true") {
			const shopkeeperId = worker.shopkeeperId;
			const shopkeeperUser = await UserModel.findById(shopkeeperId);
			if (!shopkeeperUser) {
				const message = `Shopkeeper not found`;
				return { info: new Response(RESPONSE.FAILURE, { message }) };
			}
			return { workerUser, shopkeeperUser };
		}
		return { workerUser };
	} catch (error) {
		handleError(error);
	}
};

const getWorkerById = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const [workerUser, address, worker] = await Promise.all([
			UserModel.findById(workerId),
			AddressModel.findById(workerId),
			WorkerModel.findById(workerId),
		]);
		if (!workerUser || !worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const { serviceOrders, itemOrders } = getOrders(workerId);
		const message = "Found worker";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				workerUser,
				address,
				worker,
				serviceOrders,
				itemOrders,
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const getWorkerByPhone = async (req, res) => {
	try {
		const phone = req.body.phone;
		const workerUser = await UserModel.findOne({ phone });
		const [address, worker] = await Promise.all([
			AddressModel.findById(workerUser._id),
			WorkerModel.findById(workerUser._id),
		]);
		if (!workerUser || !worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found worker";
		res.json(new Response(RESPONSE.SUCCESS, { message, workerUser, address, worker }));
	} catch (error) {
		handleError(error);
	}
};

const getRequestedOrders = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const lastKey = req.body.lastKey || "";

		const workerUser = await UserModel.findById(workerId);
		if (!workerUser) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		let serviceOrders =
			lastKey == ""
				? await ServiceOrderModel.find({ workerId })
						.sort({ placedDate: -1 })
						.limit(Number(process.env.LIMIT_ORDERS))
				: await ServiceOrderModel.find({ workerId, _id: { $gt: lastKey } })
						.sort({ placedDate: -1 })
						.limit(Number(process.env.LIMIT_ORDERS));

		serviceOrders = await Promise.all(
			serviceOrders.map(async (serviceOrder) => {
				const [user, address, service] = await Promise.all([
					UserModel.findById(serviceOrder.userId),
					AddressModel.findById(serviceOrder.userId),
					ServiceModel.findById(serviceOrder.serviceId),
				]);

				return { user, address, service, serviceOrder };
			})
		);

		const message = "Orders found";
		res.json(new Response(RESPONSE.SUCCESS, { message, serviceOrders }));
	} catch (error) {
		handleError(error);
	}
};

const registerWorker = async (req, res) => {
	try {
		const { userName, phone, role } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const password = await encrypt(req.body.password);
		const pincodes = Array.from(new Set(stringToArray(req.body.pincodes)));
		const files = req.files;
		const profilePicture = files.profilePicture[0].filename;
		const proofs = [files.proofs[0].filename];
		if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);

		const user = await UserModel.findOne({ phone });
		if (user) {
			await Promise.all([
				deleteFiles(proofs, "tempUploads"),
				deleteFiles([profilePicture], "tempUploads"),
			]);
			const message = "Registered phone number already";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const _id = mongoose.Types.ObjectId();
		const workerUser = new UserModel({ _id, userName, phone, password, role });
		const address = new AddressModel({ _id, society, area, pincode, city, state });
		const worker = new WorkerModel({ _id, profilePicture, proofs });
		const locations = pincodes.map((pincode) => new LocationModel({ workerId: _id, pincode }));

		await Promise.all([
			worker.save(),
			address.save(),
			workerUser.save(),
			useSharp(proofs),
			useSharp([profilePicture]),
			LocationModel.insertMany(locations),
		]);

		const message = "Registered worker";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: _id }));
	} catch (error) {
		handleError(error);
	}
};

const updateWorker = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const { userName, phone, password, newPassword } = req.body;
		const { society, area, pincode, city, state } = req.body;
		let pincodes = Array.from(new Set(stringToArray(req.body.pincodes)));
		const files = req.files;
		let profilePicture = null,
			proofs = null;

		if (files.profilePicture) profilePicture = files.profilePicture[0].filename;
		if (files.proofs) {
			proofs = [files.proofs[0].filename];
			if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);
		}

		const [workerUser, worker] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
		]);
		if (!workerUser || !worker) {
			if (profilePicture) await deleteFiles([profilePicture], "tempUploads");
			if (proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const isMatch = await bcrypt.compare(password, workerUser.password);
		if (!isMatch) {
			if (profilePicture) await deleteFiles([profilePicture], "tempUploads");
			if (proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Incorrect password";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		workerUser.userName = userName;
		workerUser.phone = phone;
		if (newPassword) workerUser.password = await encrypt(newPassword);

		worker.isVerified = false;
		if (profilePicture) {
			await Promise.all([useSharp([profilePicture]), deleteFiles([worker.profilePicture])]);
			worker.profilePicture = profilePicture;
		}
		if (proofs) {
			await Promise.all([useSharp(proofs), deleteFiles(worker.proofs)]);
			worker.proofs = proofs;
		}

		let oldLocations = await LocationModel.find({ workerId });
		let common = oldLocations
			.filter((location) => pincodes.includes(location.pincode))
			.map((location) => location.pincode);

		pincodes = pincodes.filter((pincode) => !common.includes(pincode));
		oldLocations = oldLocations.filter((location) => !common.includes(location.pincode));
		const locations = pincodes.map((pincode) => new LocationModel({ workerId, pincode }));

		await Promise.all([
			worker.save(),
			workerUser.save(),
			AddressModel.findByIdAndUpdate(workerId, { society, area, pincode, city, state }),
			LocationModel.insertMany(locations),
			LocationModel.deleteMany(oldLocations),
		]);

		const message = "Updated worker";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const removeWorker = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const [workerUser, worker] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
		]);
		if (!workerUser || !worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await Promise.all([
			worker.delete(),
			workerUser.delete(),
			AddressModel.findByIdAndDelete(workerId),
			deleteFiles(worker.proofs),
			deleteFiles([worker.profilePicture]),
			LocationModel.deleteMany({ workerId }),
			ServiceModel.deleteMany({ serviceProviderId: workerId }),
			WorkerServiceModel.deleteMany({ workerId }),
		]);

		const message = "Deleted worker";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getWorkerById,
	getWorkerByPhone,
	getWorkerWithShopkeeperById,
	getRequestedOrders,
	registerWorker,
	updateWorker,
	removeWorker,
};
