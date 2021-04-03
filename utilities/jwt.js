const jwt = require("jsonwebtoken");

module.exports = { getJwt };

function getJwt(payload) {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, process.env.SESSION_SECRET, { expiresIn: "1d" }, (err, token) => {
			if (err) reject(err);
			else resolve(token);
		});
	});
}
