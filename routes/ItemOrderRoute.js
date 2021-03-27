const router = require("express").Router();
const {
	getItemOrder,
	cancelItemOrder,
	replaceItemOrder,
	changeItemOrderStatus,
} = require("../controllers/ItemOrderController");

/**
 * GET
 */
// body -> {userId}
// resp -> {success, message, user?, address?, orderItemPacks}
router.get("/:orderId", getItemOrder);

/**
 * POST
 */
// body -> {}
// resp -> {success, message, id:newOrderId}
router.post("/:orderId", replaceItemOrder);

/**
 * PUT
 */
// body -> {userId}
// resp -> {success, message}
router.put("/changeStatus/:subOrderId", changeItemOrderStatus);

/**
 * DELETE
 */
// body -> {userId}
// resp -> {success, message}
router.delete("/:subOrderId", cancelItemOrder);

module.exports = router;
