const mongoose = require("mongoose");

const UserModel = require("../models/User");
const ServiceModel = require("../models/Service");
const ShopkeeperModel = require("../models/Shopkeeper");
const WorkerModel = require("../models/Worker");
const ServiceOrderModel = require("../models/ServiceOrder");
const WorkerServiceModel = require("../models/WorkerService");
const RatingModel = require("../models/Rating");
const Response = require("../models/Response");
const ROLE = require("../models/Enums/ROLE");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");
const { getRatingsWithUserName } = require("./RatingController");

const handleError = require("../utilities/errorHandler");
const { sendNotifications } = require("../utilities/notifications");

const getService = async (req, res) => {
	try {
		const serviceId = req.params.serviceId;
		const service = await ServiceModel.findById(serviceId);
		if (!service) {
			const message = "Service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found service";
		res.json(new Response(RESPONSE.SUCCESS, { message, service }));
	} catch (error) {
		handleError(error);
	}
};

const getWorkerServiceWithRatings = async (req, res) => {
	try {
		const workerServiceId = req.params.workerServiceId;
		const workerService = await WorkerServiceModel.findById(workerServiceId);
		if (!workerService) {
			const message = "Worker service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const workerId = workerService.workerId;
		const serviceId = workerService.serviceId;
		const [workerUser, worker, service, ratings] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
			ServiceModel.findById(serviceId),
			getRatingsWithUserName(serviceId),
		]);

		const message = "Found service";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				service,
				workerUser,
				worker,
				workerService,
				ratings,
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const getServices = async (req, res) => {
	try {
		const serviceProviderId = req.params.serviceProviderId;
		const lastKey = req.body.lastKey || "";

		const services =
			lastKey == ""
				? await ServiceModel.find({ serviceProviderId }).limit(
						Number(process.env.LIMIT_SERVICES)
				  )
				: await ServiceModel.find({ serviceProviderId, _id: { $gt: lastKey } }).limit(
						Number(process.env.LIMIT_SERVICES)
				  );

		const message = "Found services";
		res.json(new Response(RESPONSE.SUCCESS, { message, services }));
	} catch (error) {
		handleError(error);
	}
};

const addService = async (req, res) => {
	try {
		const serviceProviderId = req.params.serviceProviderId;
		const serviceProviderUser = await UserModel.findById(serviceProviderId);
		if (!serviceProviderUser || serviceProviderUser.role === ROLE.USER) {
			const message = "Service provider not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const service = new ServiceModel();
		const _id = mongoose.Types.ObjectId();
		service._id = _id;
		service.serviceProviderId = serviceProviderId;
		service.serviceName = req.body.serviceName;
		service.serviceCategory = req.body.serviceCategory;
		service.subCategory = req.body.subCategory;
		service.description = req.body.description;

		if (serviceProviderUser.role === ROLE.WORKER) {
			const workerService = new WorkerServiceModel({
				workerId: serviceProviderId,
				serviceId: _id,
			});
			await Promise.all([workerService.save(), service.save()]);
		} else {
			const workers = await WorkerModel.find({ shopkeeperId: serviceProviderId });
			await Promise.all([
				service.save(),
				workers.map((worker) =>
					new WorkerServiceModel({ workerId: worker._id, serviceId: _id }).save()
				),
			]);
		}

		const message = "Added service";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: service._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateService = async (req, res) => {
	try {
		const serviceId = req.params.serviceId;
		const service = await ServiceModel.findById(serviceId);
		if (!service) {
			const message = "Service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		service.serviceName = req.body.serviceName;
		service.serviceCategory = req.body.serviceCategory;
		service.subCategory = req.body.subCategory;
		service.description = req.body.description;

		await service.save();
		const message = "Updated service";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const deleteService = async (req, res) => {
	try {
		const serviceId = req.params.serviceId;
		const service = await ServiceModel.findById(serviceId);
		if (!service) {
			const message = "Service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const serviceProviderUser = await UserModel.findById(service.serviceProviderId);
		if (!serviceProviderUser) {
			const message = "Service provider not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (serviceProviderUser.role == ROLE.WORKER) {
			await Promise.all([
				service.delete(),
				WorkerServiceModel.deleteOne({ workerId: serviceProviderId, serviceId }),
			]);
		} else {
			const workers = await WorkerModel.find({ shopkeeperId: serviceProviderId });
			await Promise.all([
				service.delete(),
				workers.map((worker) =>
					WorkerServiceModel.deleteOne({ workerId: worker._id, serviceId })
				),
			]);
		}

		const message = "Deleted service";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const bookService = async (req, res) => {
	try {
		const serviceId = req.params.serviceId;
		const userId = req.body.userId;
		const workerId = req.body.workerId;

		const [service, user, workerUser, worker, workerService] = await Promise.all([
			ServiceModel.findById(serviceId),
			UserModel.findById(userId),
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
			WorkerServiceModel.findOne({ workerId, serviceId }),
		]);

		let message = null;
		if (!service) message = "Service not found";
		else if (!user) message = "User not found";
		else if (!workerUser) message = "Worker not found";
		else if (!workerService) message = "Service for worker not found";

		if (message) return res.json(new Response(RESPONSE.FAILURE, { message }));

		const serviceOrder = new ServiceOrderModel();
		serviceOrder.userId = userId;
		serviceOrder.workerId = workerId;
		serviceOrder.serviceId = serviceId;
		serviceOrder.price = req.body.price;
		serviceOrder.metaData = req.body.metaData;

		workerService.orderedCount++;
		await Promise.all([serviceOrder.save(), workerService.save()]);

		const targets = [user.phone, workerUser.phone];
		if (worker.isDependent === "true") {
			const shopkeeperUser = await ShopkeeperModel.findById(worker.shopkeeperId);
			targets.push(shopkeeperUser.phone);
		}

		message = `Order placed with total price : ${serviceOrder.price}`;
		sendNotifications(message, targets, NOTIFICATION.PLACED_ORDER);

		message = "Placed order";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: serviceOrder._id }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getService,
	getWorkerServiceWithRatings,
	getServices,
	addService,
	updateService,
	deleteService,
	bookService,
};
