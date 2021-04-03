const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
	getItemsRandom,
	getItem,
	getItemWithRatings,
	addItem,
	updateItem,
	deleteItem,
	addToCart,
	getItems,
} = require("../controllers/ItemController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, item, ratings}
router.get("/random", getItemsRandom);
// body -> {}
// resp -> {success, message, item}
router.get("/:itemId", getItem);
// body -> {}
// resp -> {success, message, item, ratings}
router.get("/withRatings/:itemId", getItemWithRatings);
// body -> {lastKey}
// resp -> {success, message, items}
router.get("/items/:shopkeeperId", getItems);

/**
 * POST
 */
// body -> {itemName, price, description, itemImage}
// resp -> {success, message, id:itemId}
router.post("/:shopkeeperId", upload, addItem);
// body -> {userId, price, count}
// resp -> {success, message, id:itemOrderId}
router.post("/toCart/:itemId", addToCart);

/**
 * PUT
 */
// body -> {itemName, price, description, itemImage?}
// resp -> {success, message}
router.put("/:itemId", upload, updateItem);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:itemId", deleteItem);

module.exports = router;
