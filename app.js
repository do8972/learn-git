const express = require("express");
const objectsRouter = require("./router/objects");
const app = express();

app.use(express.json());

app.use("/objects", objectsRouter);

app.get("/", (req, res) => {
  res.status(201).send("success");
});

app.listen(8000);
// git-test