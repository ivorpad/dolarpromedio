const { db } = require('../config/db')

module.exports = async (req, res) => {
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
};
