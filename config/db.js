const firebase = require("firebase/app");
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

const db = firebase.firestore();
const dolarRef = db.collection("dolar-promedio");

module.exports = {
  db,
  dolarRef
};