const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();
router.post("/subscribe", notificationController.subscribe);
router.post("/expiry", notificationController.subscribeAndSend);

module.exports = router;