const router = require("express").Router();
const {
	sendResetPasswordOtp,
	verifyResetPasswordOtp,
	sendServiceOrderOtp,
	verifyServiceOrderOtp,
} = require("../controllers/OtpController");

/**
 * POST
 */
// body -> {phone}
// resp -> {success, message, OTP}
router.post("/resetPassword", sendResetPasswordOtp);
// body -> {}
// resp -> {success, message}
router.post("/serviceOrder/:serviceOrderId", sendServiceOrderOtp);

/**
 * DELETE
 */
// body -> {phone, OTP}
// resp -> {success, message}
router.delete("/resetPassword", verifyResetPasswordOtp);
// body -> {}
// resp -> {success, message}
router.delete("/serviceOrder/:serviceOrderId", verifyServiceOrderOtp);

module.exports = router;
