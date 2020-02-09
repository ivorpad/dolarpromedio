const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const firebase = require("firebase/app");
const cron = require("node-cron");
const { getDolarPromedio } = require("./helpers/dolarpromedio.js");

//const Tesseract = require("tesseract.js");
// Add OCR later ?
// Tesseract.recognize(
//   "https://pbs.twimg.com/media/D22E_NQW0AA3Qxv.jpg",
//   "eng",
//   { logger: m => console.log(m) }
// ).then(({ data: { text } }) => {
//   console.log(text);
// });

require("firebase/firestore");
require("dotenv").config();

const firebaseConfig = {
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

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
//app.use("/users", usersRouter);

const db = firebase.firestore();
const dolarRef = db.collection("dolar-promedio");

cron.schedule("0 0 */1 * * *", async () => {
  console.log(`task is running at ${new Date()} `);
  
  const result = await getDolarPromedio();

  result.forEach(p => {
		dolarRef.doc(p.id.toString()).set({
			date: p.date,
			value: p.value
		});
	});
  
});

app.get("/api/dolarpromedio", async (req, res, next) => {

	try {
		const docs = await db.collection("dolar-promedio").get();
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
