const fetch = require("isomorphic-fetch");
const { unformat } = require("./unformat");

const getDolarPromedio = async () => {
  const dolar = await fetch(
  `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=monitordolarvla&count=100`,
  {
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8."
    }
  }
).then(r => r.json());

const result = dolar
  .filter((val, i) => {
    return unformat(val.text.toLowerCase()).includes("actualizacion")
  })
  .map(val => {
    return {
      id: val.id,
      value: val.text.toLowerCase().match(/(?<=bs\.?\s)[0-9\s.,]+/g),
      date: val.created_at
    };
  })
  .reduce((acc, current, index) => {
    if (current.value !== null) {
      acc.push({
        id: current.id,
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

  return result;
}

  exports.getDolarPromedio = getDolarPromedio;