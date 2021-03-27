const Response = require("../models/Response");
const ROLE = require("../models/Enums/ROLE");
const RESPONSE = require("../models/Enums/RESPONSE");
const { getRole } = require("../controllers/UserController");

const ifLogin = async (req, res, next) => {
	if (req.isAuthenticated()) return next();
	const message = "Not authorized";
	res.json(new Response(RESPONSE.FAILURE, { message }));
};

const ifNotLogin = async (req, res, next) => {
	if (!req.isAuthenticated()) return next();
	const message = "Already logged in";
	res.json(new Response(RESPONSE.FAILURE, { message }));
};

const ifAuthorized = async (req, res, next) => {
	if (!req.isAuthenticated()) {
		const message = "Not authorized";
		return res.json(new Response(RESPONSE.FAILURE, { message }));
	}

	const userId = req.params.id;
	if (userId == req.user._id) return next();

	const role = await getRole(req.user._id);
	if (role == ROLE.ADMIN || role == ROLE.COADMIN) return next();

	const message = "Not authorized";
	return res.json(new Response(RESPONSE.FAILURE, { message }));
};

const ifAdministration = async (req, res, next) => {
	const role = await getRole(req.user._id);
	if (role == ROLE.COADMIN || role == ROLE.ADMIN) return next();

	const message = "Not authorized";
	return res.json(new Response(RESPONSE.FAILURE, { message }));
};

const ifAdmin = async (req, res, next) => {
	const role = await getRole(req.user._id);
	if (role == ROLE.ADMIN) return next();

	const message = "Not authorized";
	return res.json(new Response(RESPONSE.FAILURE, { message }));
};

module.exports = {
	ifLogin,
	ifNotLogin,
	ifAuthorized,
	ifAdministration,
	ifAdmin,
};
