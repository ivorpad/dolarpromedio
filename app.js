const cron = require("node-cron");
const { getDolarPromedio } = require("./helpers/dolarpromedio.js");
const { db } = require('./config/db')

require("dotenv").config();
const dolarRef = db.collection("dolar-promedio");

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


module.exports = app;
