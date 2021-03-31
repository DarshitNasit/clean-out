const UserModel = require("../models/User");
const ItemModel = require("../models/Item");
const ShopkeeperModel = require("../models/Shopkeeper");
const RatingModel = require("../models/Rating");
const CartItemPack = require("../models/CartItemPack");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const handleError = require("../utilities/errorHandler");
const { deleteFiles, useSharp } = require("../utilities/FileHandlers");

const getItemsRandom = async (req, res) => {
	try {
		const count = await ItemModel.countDocuments();
		const random = Math.max(Math.min(Math.floor(Math.random() * count), count - 4), 0);
		const items = await ItemModel.find().skip(random).limit(4);
		res.json(new Response(RESPONSE.SUCCESS, { message: "Items found", items }));
	} catch (error) {
		handleError(error);
	}
};

const getItem = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		console.log(`item id = ${itemId}`);

		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const ratings = await RatingModel.find({ targetId: itemId }).limit(
			process.env.LIMIT_RATING
		);
		const message = "Item found";
		res.json(new Response(RESPONSE.SUCCESS, { message, item, ratings }));
	} catch (error) {
		handleError(error);
	}
};

const getItems = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const lastKey = req.body.lastKey || "";

		const items =
			lastKey == ""
				? await ItemModel.find({ shopkeeperId }).limit(Number(process.env.LIMIT_ITEMS))
				: await ItemModel.find({ shopkeeperId, _id: { $gt: lastKey } }).limit(
						Number(process.env.LIMIT_ITEMS)
				  );

		const message = "Found services";
		res.json(new Response(RESPONSE.SUCCESS, { message, items }));
	} catch (error) {
		handleError(error);
	}
};

const addItem = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const shopkeeper = await ShopkeeperModel.findById(shopkeeperId);
		if (!shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const { itemName, price, description } = req.body;
		const itemImage = req.files.itemImage[0].filename;
		const item = new ItemModel({ shopkeeperId, itemName, price, description, itemImage });
		await Promise.all([item.save(), useSharp([itemImage])]);

		const message = "Added item";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: item._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateItem = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		item.itemName = req.body.itemName;
		item.description = req.body.description;
		item.price = req.body.price;
		item.isAvailable = req.body.isAvailable;

		if (req.files.itemImage) {
			const itemImage = req.files.itemImage[0].filename;
			await Promise.all([deleteFiles([item.itemImage]), useSharp([itemImage])]);
			item.itemImage = itemImage;
		}

		await item.save();
		const message = "Updated item";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const deleteItem = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await Promise.all([item.delete(), deleteFiles([item.itemImage])]);
		const message = "Deleted item";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const addToCart = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const userId = req.body.userId;

		const [item, user] = await Promise.all([
			ItemModel.findById(itemId),
			UserModel.findById(userId),
		]);

		let message = null;
		if (!item) message = "Item not found";
		else if (!user) message = "User not found";

		if (message) return res.json(new Response(RESPONSE.FAILURE, { message }));

		const count = req.body.count;
		const cartItemPack = new CartItemPack({ userId, itemId, count });
		await cartItemPack.save();

		message = "Added item to cart";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: cartItemPack._id }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getItemsRandom,
	getItem,
	getItems,
	addItem,
	updateItem,
	deleteItem,
	addToCart,
};
