var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fetch = require("isomorphic-fetch");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const firebase = require("firebase/app");
require("firebase/firestore");
require("dotenv").config();
var cron = require("node-cron");

var firebaseConfig = {
	apiKey: `${process.env.APIKEY}`,
	authDomain: `${process.env.AUTHDOMAIN}`,
	databaseURL: `${process.env.DATABASEURL}`,
	projectId: `${process.env.PROJECTID}`,
	storageBucket: `${process.env.STORAGEBUCKET}`,
	messagingSenderId: `${process.env.MESSAGINGSENDERID}`,
	appId: `${process.env.APPID}`,
	measurementId: `${process.env.MEASUREMENTID}`
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const docRef = db.collection("documents");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

cron.schedule("0 0 */2 * * *", async () => {
	console.log(`task is running at ${new Date()} `);
	const dolar = await fetch(
		`https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=monitordolarvla&count=2`,
		{
			headers: {
				Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8."
			}
		}
	).then(r => r.json());

	var result = dolar
		.filter((val, i) => {
			return val.text
				.toLowerCase()
				.split(" ")
				.includes("actualización");
		})
		.map(val => {
			return {
				value: val.text.toLowerCase().match(/(?<=bs\.\s)[0-9\s.,]+/g),
				date: val.created_at
			};
		})
		.reduce((acc, current, index) => {
			if (current.value !== null) {
				acc.push({
					value: Number(
						current.value[0]
							.trim()
							.replace(/\./g, "")
							.replace(/,/g, ".")
					),
					date: current.date
				});
			}

			return acc;
		}, []);

	if (result.length > 0) {
		docRef.add(result[0]);
	}
});

app.get("/api/dolarpromedio", async (req, res, next) => {
	try {
		const docs = await db.collection("documents").get();
		const docsArr = [];
		docs.forEach(doc => {
			docsArr.push(doc.data());
		});

		docsArr.sort((a, b) => new Date(b.date) - new Date(a.date));

		res.send(docsArr);
	} catch (error) {
		res.send({ error: "error retrieving data" });
	}
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
