const { db } = require('../config/db')

module.exports = async (req, res) => {

  let {show} = req.query;
  show = Number(show);

  try {
		const docs = await db.collection("dolar-promedio").get();
		const docsArr = [];
		docs.forEach(doc => {
			docsArr.push(doc.data());
		});

    docsArr.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if(show && typeof(show) === "number" && show > 0) {
      res.send(docsArr.slice(0, show));
    } else {
      res.send(docsArr);
    }

		
	} catch (error) {
		res.send({ error: "error retrieving data" });
  }
};
