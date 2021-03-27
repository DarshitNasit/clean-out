const mongoose = require("mongoose");

const Response = require("../models/Response");
const ItemModel = require("../models/Item");
const UserModel = require("../models/User");
const ItemOrderModel = require("../models/ItemOrder");
const CartItemPackModel = require("../models/CartItemPack");
const OrderItemPackModel = require("../models/OrderItemPack");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");

const handleError = require("../utilities/errorHandler");
const { sendNotifications } = require("../utilities/notifications");

const getCartItems = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		let cartItemPacks = await CartItemPackModel.find({ userId });
		const itemsToRemove = [];
		await Promise.all(
			cartItemPacks.map(async (cartItemPack) => {
				const itemId = cartItemPack.itemId;
				const item = await ItemModel.findById(itemId);
				if (!item || item.isAvailable == false) {
					const _id = cartItemPack._id;
					itemsToRemove.push(_id);
					return CartItemPack.findByIdAndDelete(_id);
				}
			})
		);

		cartItemPacks = await Promise.all(
			cartItemPacks.map(async (cartItemPack) => {
				const itemId = cartItemPack.itemId;
				const item = await ItemModel.findById(itemId);
				return { cartItemPack, item };
			})
		);

		cartItemPacks.filter((cartItemPack) => !itemsToRemove.includes(cartItemPack._id));
		const message = "Found cart";
		res.json(new Response(RESPONSE.SUCCESS, { message, cartItemPacks }));
	} catch (error) {
		handleError(error);
	}
};

const changeCartItemCount = async (req, res) => {
	try {
		const cartItemPackId = req.params.cartItemPackId;
		const cartItemPack = await CartItemPackModel.findById(cartItemPackId);
		if (!cartItemPack) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const itemId = cartItemPack.itemId;
		let value = Number(value);

		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		cartItemPack.count += value;
		if (cartItemPack.count == 0) await cartItemPack.delete();

		const message = "Updated item count";
		res.json(new Response(RESPONSE.SUCCESS, { message, cartItemPack }));
	} catch (error) {
		handleError(error);
	}
};

const clearCart = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await CartItemPackModel.deleteMany({ userId });
		const message = "Cleared cart";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const placeOrder = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE), { message });
		}

		const orderId = mongoose.Types.ObjectId();
		const cartItemPacks = await CartItemPackModel.find({ userId });
		cartItemPacks.map(async (cartItemPack) => {
			const itemId = cartItemPack.itemId;
			let item = await ItemModel.findById(itemId);
			if (!item || !item.isAvailable) return;

			const shopkeeperId = item.shopkeeperId;
			let orderItemPack = { orderId, shopkeeperId, itemId, count: cartItemPack.count };
			orderItemPack = new OrderItemPackModel(orderItemPack);
			item.orderedCount++;

			[item, orderItemPack, shopkeeperUser] = await Promise.all([
				item.save(),
				orderItemPack.save(),
				UserModel.findById(shopkeeperId),
			]);

			const price = item.price * cartItemPack.count;
			const message = `Placed order of ${price}`;
			sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.PLACED_ORDER);
		});

		const price = Number(req.body.price);
		const itemOrder = new ItemOrderModel({ userId, price });
		await Promise.all([itemOrder.save(), CartItemPackModel.deleteMany({ userId })]);

		let message = `Placed order of ${price}`;
		sendNotifications(message, [user.phone], NOTIFICATION.PLACED_ORDER);

		message = "Placed order";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: itemOrder._id }));
	} catch (error) {
		handleError(error);
	}
};

modules.exports = {
	getCartItems,
	changeCartItemCount,
	clearCart,
	placeOrder,
};
