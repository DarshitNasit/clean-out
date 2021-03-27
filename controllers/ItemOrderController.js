const mongoose = require("mongoose");

const UserModel = require("../models/User");
const ItemModel = require("../models/Item");
const AddressModel = require("../models/Address");
const ItemOrderModel = require("../models/ItemOrder");
const OrderItemPackModel = require("../models/OrderItemPack");
const Response = require("../models/Response");
const ROLE = require("../models/Enums/ROLE");
const STATUS = require("../models/Enums/STATUS");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");

const handleError = require("../utilities/errorHandler");
const { sendNotifications } = require("../utilities/notifications");

const getItemOrder = async (req, res) => {
	try {
		const userId = req.body.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (user.role == ROLE.USER) {
			const orderId = req.params.orderId;
			const itemOrder = await ItemOrderModel.findById(orderId);
			if (!itemOrder) {
				const message = "Item order not found";
				return res.json(new Response(RESPONSE.FAILURE, { message }));
			}

			let orderItemPacks = await OrderItemPackModel.find({ orderId });
			orderItemPacks = await Promise.all(
				orderItemPacks.map(async (orderItemPack) => {
					const itemId = orderItemPack.itemId;
					const item = await ItemModel.findById(itemId);
					return { orderItemPack, item };
				})
			);

			const message = "Found item order";
			res.json(new Response(RESPONSE.SUCCESS, { message, orderItemPacks }));
		} else if (user.role == ROLE.SHOPKEEPER) {
			const shopkeeperId = userId;
			const orderId = req.params.orderId;

			let [itemOrder, orderItemPacks] = await Promise.all([
				ItemOrderModel.findById(orderId),
				OrderItemPackModel.find({ orderId, shopkeeperId }),
			]);
			orderItemPacks = await Promise.all(
				orderItemPacks.map(async (orderItemPack) => {
					const itemId = orderItemPack.itemId;
					const item = await ItemModel.findById(itemId);
					return { orderItemPack, item };
				})
			);

			const [user, address] = await Promise.all([
				UserModel.findById(itemOrder.userId),
				AddressModel.findById(itemOrder.userId),
			]);
			const message = "Found item order";
			res.json(new Response(RESPONSE.SUCCESS, { message, user, address, orderItemPacks }));
		} else {
			const message = "Invalid request";
			res.json(new Response(RESPONSE.FAILURE, { message }));
		}
	} catch (error) {
		handleError(error);
	}
};

const cancelItemOrder = async (req, res) => {
	try {
		const userId = req.body.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (user.role == ROLE.USER) {
			const subOrderId = req.params.subOrderId;
			let orderItemPack = await OrderItemPackModel.findById(subOrderId);
			if (!orderItemPack) {
				const message = "Item order not found";
				return res.json(new Response(RESPONSE.FAILURE, { message }));
			}

			const isAdministration = [ROLE.ADMIN, ROLE.COADMIN].includes(req.user.role);
			if (orderItemPack.status != STATUS.PENDING && !isAdministration) {
				const message = "Cannot cancel order";
				res.json(new Response(RESPONSE.FAILURE, { message }));
			}

			let item = await ItemModel.findById(orderItemPack.itemId);
			if (!item) {
				const message = "Item not found";
				return res.json(new Response(RESPONSE.FAILURE, { message }));
			}

			item.orderedCount--;
			orderItemPack.status = STATUS.CANCELLED;
			const [item, shopkeeperUser, orderItemPack] = await Promise.all([
				item.save(),
				UserModel.findById(item.shopkeeperId),
				orderItemPack.save(),
			]);

			let message = `Cancelled order of ${item.itemName} to ${user.userName}`;
			sendNotifications(
				message,
				[user.phone, shopkeeperUser.phone],
				NOTIFICATION.CANCEL_ORDER
			);

			message = "Cancelled order";
			res.json(new Response(RESPONSE.SUCCESS, { message }));
		} else if (user.role == ROLE.SHOPKEEPER) {
			const subOrderId = req.params.subOrderId;
			const orderItemPack = await OrderItemPackModel.findById(subOrderId);
			if (!orderItemPack) {
				const message = "Item order not found";
				return res.json(new Response(RESPONSE.FAILURE, { message }));
			}

			const isAdministration = [ROLE.ADMIN, ROLE.COADMIN].includes(req.user.role);
			if (orderItemPack.status == STATUS.DELIVERED && !isAdministration) {
				const message = "Cannot cancel order";
				res.json(new Response(RESPONSE.FAILURE, { message }));
			}

			let item = await ItemModel.findById(orderItemPack.itemId);
			if (!item) {
				const message = "Item not found";
				return res.json(new Response(RESPONSE.FAILURE, { message }));
			}

			item.orderedCount--;
			orderItemPack.status = STATUS.CANCELLED;
			const [item, shopkeeperUser, orderItemPack] = await Promise.all([
				item.save(),
				UserModel.findById(item.shopkeeperId),
				orderItemPack.save(),
			]);

			let message = `Cancelled order of ${item.itemName} to ${user.userName}`;
			sendNotifications(
				message,
				[user.phone, shopkeeperUser.phone],
				NOTIFICATION.CANCEL_ORDER
			);

			message = "Cancelled order";
			res.json(new Response(RESPONSE.SUCCESS, { message }));
		} else {
			const message = "Invalid request";
			res.json(new Response(RESPONSE.FAILURE, { message }));
		}
	} catch (error) {
		handleError(error);
	}
};

const replaceItemOrder = async (req, res) => {
	try {
		const orderId = req.params.orderId;
		const itemOrder = await ItemOrderModel.findById(orderId);
		if (!itemOrder) {
			const message = "Item order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = itemOrder.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const newOrderId = mongoose.Types.ObjectId();
		const orderItemPacks = await OrderItemPackModel.find({ orderId });
		orderItemPacks.map(async (orderItemPack) => {
			const shopkeeperId = orderItemPack.shopkeeperId;
			const itemId = orderItemPack.itemId;
			const [shopkeeperUser, item] = await Promise.all([
				UserModel.findById(shopkeeperId),
				ItemModel.findById(itemId),
			]);

			if (!shopkeeperUser || !item) return;

			const newOrderItemPack = new OrderItemPackModel({
				orderId: newOrderId,
				shopkeeperId,
				itemId,
				count: orderItemPack.count,
			});

			item.orderedCount++;
			await Promise.all([item.save(), newOrderItemPack.save()]);

			const price = item.price * orderItemPack.count;
			const message = `Placed order of ${price}`;
			sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.PLACED_ORDER);
		});

		let message = `Placed order of ${itemOrder.price}`;
		sendNotifications(message, [user.phone], NOTIFICATION.PLACED_ORDER);

		message = "Placed order";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: newOrderId }));
	} catch (error) {
		handleError(error);
	}
};

const changeItemOrderStatus = async (req, res) => {
	try {
		const subOrderId = req.params.subOrderId;
		const status = req.body.status;

		const orderItemPack = await OrderItemPackModel.findById(subOrderId);
		if (!orderItemPack) {
			const message = "Item order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
		const [itemOrder, item] = await Promise.all([
			ItemOrderModel.findById(orderItemPack.orderId),
			ItemModel.findById(orderItemPack.itemId),
		]);
		const user = await UserModel.findById(itemOrder.userId);

		orderItemPack.status = status;
		await orderItemPack.save();

		if (status == STATUS.DISPATCHED) {
			const message = `${item.itemName} dispatched`;
			sendNotifications(message, [user.phone], NOTIFICATION.DISPATCHED_ORDER);
		} else if (status == STATUS.DELIVERED) {
			const message = `${item.itemName} delivered`;
			sendNotifications(message, [user.phone], NOTIFICATION.DELIVERED_ORDER);
		}

		const message = "Changed status";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getItemOrder,
	cancelItemOrder,
	replaceItemOrder,
	changeItemOrderStatus,
};
