const router = require("express").Router();

router.use("/otp", require("./OtpRoute"));
router.use("/user", require("./UserRoute"));
router.use("/auth", require("./AuthRoute"));
router.use("/test", require("./TestRoute"));
router.use("/item", require("./ItemRoute"));
router.use("/worker", require("./WorkerRoute"));
router.use("/rating", require("./RatingRoute"));
router.use("/address", require("./AddressRoute"));
router.use("/service", require("./ServiceRoute"));
router.use("/shopkeeper", require("./ShopkeeperRoute"));
router.use("/serviceOrder", require("./ServiceOrderRoute"));
router.use("/serviceCategory", require("./ServiceCategoryRoute"));

module.exports = router;
