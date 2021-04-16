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
app.use(express.static("public"));
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
 * Connect to react app
 */
if (process.env.APP_ENV === "production") {
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "public", "build", "index.html"));
	});
}

/**
 * Verifying folders
 */
if (!fs.existsSync("public/uploads")) fs.mkdirSync("public/uploads");
if (!fs.existsSync("public/tempUploads")) fs.mkdirSync("public/tempUploads");

/**
 * Load necessary data
 */
// require("./database/LoadServiceCategory")();
require("./database/Admin")();

/**
 * Start cron jobs
 */
require("./utilities/cronJobs")();

/**
 * Listen requests
 */
app.listen(process.env.PORT, () =>
	console.log(`App is running in ${process.env.APP_ENV} environment on port ${process.env.PORT}`)
);
