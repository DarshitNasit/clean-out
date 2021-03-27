const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
	getWorkerById,
	getWorkerByPhone,
	getRequestedOrders,
	registerWorker,
	updateWorker,
	removeWorker,
} = require("../controllers/WorkerController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, workerUser, address, worker, serviceOrders, itemOrders}
router.get("/:workerId", getWorkerById);
// body -> {phone}
// resp -> {success, message, workerUser, address, worker}
router.get("/phone", getWorkerByPhone);
// body -> {lastKey}
// resp -> {success, message, serviceOrders}
router.get("/requestedOrders/:workerId", getRequestedOrders);

/**
 * POST
 */
// body -> {userName, phone, password, role, society, area, pincode, city, state, profilePicture, proofs, pincodes}
// resp -> {success, message, id:workerId}
router.post("", upload, registerWorker);

/**
 * PUT
 */
// body -> {userName, phone, password, newPassword?, society, area, pincode, city, state, profilePicture?, proofs?, pincodes}
// resp -> {success, message}
router.put("/:workerId", upload, updateWorker);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:workerId", removeWorker);

module.exports = router;
