const router = require("express").Router();
const {
	getCartItems,
	changeCartItemCount,
	clearCart,
	placeOrder,
} = require("../controllers/CartController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, cartItemPacks}
router.get("/:userId", getCartItems);

/**
 * POST
 */
// body -> {price}
// resp -> {success, message, id:itemOrderId}
router.post("/placeOrder/:userId", placeOrder);

/**
 * PUT
 */
// body -> {cartItemPackId, value}
// resp -> {success, message, cartItemPack}
router.put("/:cartItemPackId", changeCartItemCount);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:userId", clearCart);

module.exports = router;
