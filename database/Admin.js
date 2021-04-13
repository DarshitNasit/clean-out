const UserModel = require("../models/User");
const ROLE = require("../models/Enums/ROLE");
const encrypt = require("../utilities/encrypt");

const admin = new UserModel(
	Object.fromEntries(
		new Map(
			process.env.ADMIN.split(",")
				.map((str) => str.trim().split(":"))
				.map((arr) => [arr[0], arr[1].trim()])
		)
	)
);

module.exports = addAdmin;

async function addAdmin() {
	admin.role = ROLE.ADMIN;
	admin.password = await encrypt(admin.password);
	if (await UserModel.findOne({ phone: admin.phone })) return;
	else await admin.save();
}
