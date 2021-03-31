const router = require("express").Router();
const { getServiceCategories } = require("../controllers/ServiceCategoryController");

/**
 * GET
 */
// body -> {}
// response -> {success, message, categories}
router.get("", getServiceCategories);

module.exports = router;
