const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("../models/User");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const bcrypt = require("bcryptjs");

module.exports = async (passport) => {
	passport.use(new LocalStrategy({ usernameField: "phone" }, verifyFunction));

	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const user = await UserModel.findById(id);
			done(null, user);
		} catch (error) {
			done(err, false);
		}
	});
};

const verifyFunction = async (phone, password, done) => {
	try {
		const user = await UserModel.findOne({ phone });
		if (!user) {
			const message = "Invalid contact number";
			return done(null, false, new Response(RESPONSE.FAILURE, { message }));
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (isMatch) {
			const message = "Successfully logged in";
			return done(null, user, new Response(RESPONSE.SUCCESS, { message }));
		}

		const message = "Password incorrect";
		return done(null, false, new Response(RESPONSE.FAILURE, { message }));
	} catch (error) {
		done(error, false);
	}
};
