const express = require("express");
const mongoose = require("mongoose");
const File = require("./file");

const app = express();
const port = 4000;

const dbURI =
  "mongodb://dist:dist123@cluster0-shard-00-00.aldhx.mongodb.net:27017,cluster0-shard-00-01.aldhx.mongodb.net:27017,cluster0-shard-00-02.aldhx.mongodb.net:27017/files?ssl=true&replicaSet=atlas-rtgjl1-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(port))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("hello my world br");
});
