const express = require("express");
const objectsController = require("../controller/objects");

const router = express.Router();

router.put("/", objectsController.putObject);
router.get("/:objectId", objectsController.getObject);

module.exports = router;
