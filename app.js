const createError = require("http-errors");
const express = require("express");
const cron = require("node-cron");
const {dolarRef} = require('./config/db');
const {getDolarPromedio} = require('./helpers/dolarpromedio');

require("dotenv").config();

const app = express();

app.get('/', (req, res, n) => res.send('cron job is running'))

cron.schedule("0 * * * *", async () => {
  console.log(`task is running at ${new Date()} `);
  
  const result = await getDolarPromedio();

  result.forEach(p => {
		dolarRef.doc(p.id.toString()).set({
			date: p.date,
			value: p.value
		});
	});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

module.exports = app;
