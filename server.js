/**
 * External Modules
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
const express = require("express");
const passport = require("passport");
const connectDB = require("./config/dbConfig");

/**
 * Configurations
 */
connectDB();

/**
 * Define Application
 */
const app = express();

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
 * Express session
 */
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: Number(process.env.SESSION_EXPIRE), sameSite: true },
	})
);

/**
 * Middlewares
 */
require("./config/passportConfig")(passport);
app.use(passport.initialize());
app.use(passport.session());

/**
 * CORS
 */
app.use(cors());

/**
 * Routes
 */
app.use("/otp", require("./routes/OtpRoute"));
app.use("/user", require("./routes/UserRoute"));
app.use("/auth", require("./routes/AuthRoute"));
app.use("/test", require("./routes/TestRoute"));
app.use("/item", require("./routes/ItemRoute"));
app.use("/worker", require("./routes/WorkerRoute"));
app.use("/rating", require("./routes/RatingRoute"));
app.use("/service", require("./routes/ServiceRoute"));
app.use("/shopkeeper", require("./routes/ShopkeeperRoute"));
app.use("/serviceOrder", require("./routes/ServiceOrderRoute"));

/**
 * Verifying folders
 */
if (!fs.existsSync(process.env.UPLOADS)) fs.mkdirSync(process.env.UPLOADS);
if (!fs.existsSync(process.env.TEMP_UPLOADS)) fs.mkdirSync(process.env.TEMP_UPLOADS);

/**
 * Listen requests
 */
app.listen(process.env.PORT, () =>
	console.log(`App is running in ${process.env.APP_ENV} environment on port ${process.env.PORT}`)
);
