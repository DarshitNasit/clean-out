const passport = require("passport");

const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const handleError = require("../utilities/errorHandler");

const loginUser = (req, res, next) => {
	const { phone, password } = req.body;

	if (!phone || !password) {
		const message = "Missing credentials";
		return res.json(new Response(RESPONSE.FAILURE, { message }));
	}

	passport.authenticate("local", (err, user, info) => {
		try {
			if (err) throw err;
			if (info.success === RESPONSE.FAILURE) return res.json(info);
			req.login(user, (err) => {
				if (err) throw err;
				res.json(info);
			});
		} catch (error) {
			handleError(err);
		}
	})(req, res, next);
};

const logoutUser = (req, res, next) => {
	req.logout();

	const message = "Logged out";
	res.json(new Response(RESPONSE.SUCCESS, { message }));
};

module.exports = {
	loginUser,
	logoutUser,
};
