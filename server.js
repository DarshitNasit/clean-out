/**
 * External Modules
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const express = require("express");
const passport = require("passport");
const connectDB = require("./config/dbConfig");
const ItemModel = require("./models/Item");

/**
 * Define Application
 */
const app = express();

/**
 * Configurations
 */
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(process.env.PUBLIC_FOLDER));
app.use("/images", express.static("public/uploads"));

/**
 * Logging
 */
if (process.env.APP_ENV === "development") {
	app.use(logger("dev"));
}

/**
 * Middlewares
 */
require("./config/passportConfig")(passport);
app.use(passport.initialize());

/**
 * CORS
 */
app.use(cors());

/**
 * Routes
 */
app.use(require("./routes"));

/**
 * Verifying folders
 */
if (!fs.existsSync(process.env.UPLOADS)) fs.mkdirSync(process.env.UPLOADS);
if (!fs.existsSync(process.env.TEMP_UPLOADS)) fs.mkdirSync(process.env.TEMP_UPLOADS);

/**
 * Load necessary data
 */
// require("./database/LoadServiceCategory")();

// async function fun() {
// 	const item = await ItemModel.findById("6061da2747704906283c3de1");
// 	item.ratingCount = 0;
// 	item.ratingValue = 2.5;
// 	await item.save();
// }
// fun();

/**
 * Listen requests
 */
app.listen(process.env.PORT, () =>
	console.log(`App is running in ${process.env.APP_ENV} environment on port ${process.env.PORT}`)
);
