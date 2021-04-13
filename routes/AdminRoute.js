const router = require("express").Router();

const { getInitialData, getUsers } = require("../controllers/AdminController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, totalUsers, totalWorkers, totalShopkeepers, totalItemOrders, totalServiceOrders}
router.get("", getInitialData);
// body -> {q:searchBy, q:searchFor, q:page, q:search, q:verification}
// resp -> {success, message, users, totalItems}
router.get("/users", getUsers);

module.exports = router;
