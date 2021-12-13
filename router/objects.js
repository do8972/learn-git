const express = require("express");
const objectsController = require("../controller/objects");

const router = express.Router();

router.put("/", objectsController.putObject);

module.exports = router;
