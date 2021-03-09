const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const cors = require("cors");
const app = express();
var admin = require("firebase-admin");
app.use(bodyParser.json());
var serviceAccount = require("./key.json");

function init() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://the-deck-of-card-default-rtdb.firebaseio.com",
  });

  app.use(bodyParser.json());
  app.use(cors());
  console.log("Database is connect.");
}

init();

app.get("/", async (req, res) => {
  res.send("server is running");
});

app.get("/user", async (req, res) => {
  const { uid } = req.query;
  try {
    let a = await admin.firestore().collection("user").doc(uid).get();
    if (!a.exists) {
      res.send({ res: `${uid} has not exists` });
    } else {
      res.send({ res: a.data() });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { uid, password } = req.body;
  try {
    console.log(uid, password);
    let a = await admin.firestore().collection("user").doc(uid).get();
    console.log(a);
    if (!a.exists) {
      res.send(`${uid} has not exists`);
    } else {
      if (a.data().password == password) {
        res.send(a.data());
      } else {
        res.send(false);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/user", async (req, res) => {
  const { id, displayName, email, photoURL, phone, password } = req.body;
  console.log(id, displayName, email, photoURL, phone, password);
  try {
    let a = await admin.firestore().collection("user").doc(id).get();
    if (!a.exists) {
      await admin.firestore().collection("user").doc(id).create({
        id: id,
        displayName: displayName,
        email: email,
        photoURL: photoURL,
        phone: phone,
        password: password,
      });
      res.send({ mess: id });
      return
    } else {
      res.send({ mess: 'err' });
      return
    }
  } catch (error) {
    console.log(error);
  }
});

app.put("/user/addCoin", async (req, res) => {
  const { id } = req.body;
  console.log(id);
  try {
    let a = await admin.firestore().collection("user").doc(id).get();
    if (a.exists) {
      if (a.data()['timeAddCoin'] == undefined || a.data()['coin'] == undefined) {
        await admin.firestore().collection("user").doc(id).update({ coin: 30000, timeAddCoin: Date.now().toString() })
        res.send({ mess: 'ok' })
        return
      }

      let timeAddCoin = a.data()['timeAddCoin']
      timeAddCoin = Date.now().toString() - timeAddCoin
      let coin = a.data()['coin']
      //86400000= 24h
      if (timeAddCoin > 86400000 && coin < 1000) {
        coin = coin + 30000
        await admin.firestore().collection("user").doc(id).update({ coin: coin, timeAddCoin: Date.now().toString() })
        res.send({ mess: 'ok' })
        return
      }
      else {
        res.send({ mess: 'err' });
        return
      }
    } else {
      res.send({ mess: 'err' });
      return
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;