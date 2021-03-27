const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
	getShopkeeperById,
	getShopkeeperByPhone,
	getWorkers,
	getRequestedOrders,
	registerShopkeeper,
	updateShopkeeper,
	removeShopkeeper,
} = require("../controllers/ShopkeeperController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, shopkeeperUser, address, shopkeeper, serviceOrders, itemOrders}
router.get("/:shopkeeperId", getShopkeeperById);
// body -> {phone}
// resp -> {success, message, shopkeeperUser, address, shopkeeper}
router.get("/phone", getShopkeeperByPhone);
// body -> {lastKey}
// resp -> {success, message, workers}
router.get("/workers/:shopkeeperId", getWorkers);
// body -> {lastKeyServiceOrder, lastKeyItemOrder}
// resp -> {success, message, itemOrders, serviceOrders}
router.get("/requestedOrders/:shopkeeperId", getRequestedOrders);

/**
 * POST
 */
// body -> {userName, phone, password, role, society, area, pincode, city, state, shopName, proofs}
// resp -> {success, message, id:shopkeeperId}
router.post("", upload, registerShopkeeper);

/**
 * PUT
 */
// body -> {userName, phone, password, newPassword, society, area, pincode, city, state, shopName, proofs?}
// resp -> {success, message}
router.put("/:shopkeeperId", upload, updateShopkeeper);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:shopkeeperId", removeShopkeeper);

module.exports = router;
