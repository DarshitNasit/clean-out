const router = require("express").Router();
const {
	getService,
	getWorkerServiceWithRatings,
	getServices,
	addService,
	updateService,
	deleteService,
	bookService,
} = require("../controllers/ServiceController");

/**
 * GET
 */
// body -> {workerId}
// resp -> {success, message, service}
router.get("/:serviceId", getService);
// body -> {}
// resp -> {success, message, service, workerUser, worker, workerService, ratings}
router.get("/workerService/:workerServiceId", getWorkerServiceWithRatings);
// body -> {lastKey}
// resp -> {success, message, services}
router.get("/services/:serviceProviderId", getServices);

/**
 * POST
 */
// body -> {serviceName, price, maxSquareFeet, serviceCategory, subCategory, description}
// resp -> {success, message, id:serviceId}
router.post("/:serviceProviderId", addService);
// body -> {userId, workerId, price, metaData}
// resp -> {success, message, id:serviceOrderId}
router.post("/bookService/:serviceId", bookService);

/**
 * PUT
 */
// body -> {serviceName, price, maxSquareFeet, serviceCategory, subCategory, description}
// resp -> {success, message}
router.put("/:serviceId", updateService);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:serviceId", deleteService);

module.exports = router;
