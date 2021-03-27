const router = require("express").Router();
const {
	getRatingById,
	addRating,
	updateRating,
	deleteRating,
} = require("../controllers/RatingController");

/**
 * GET
 * */
// body -> {}
// resp -> {success, message, rating}
router.get("/:ratingId", getRatingById);

/**
 * POST
 */
// body -> {targetId, ratingValue, description}
// resp -> {success, message, id:ratingId}
router.post("/:userId", addRating);

/**
 * PUT
 */
// body -> {value, description}
// resp -> {success, message}
router.put("/:ratingId", updateRating);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:ratingId", deleteRating);

module.exports = router;
