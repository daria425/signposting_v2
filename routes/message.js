const express = require("express");
const { sendTextMessage } = require("../controllers/messageController");
const router = express.Router();

router.post("/", async (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  const recipient = body.WaId;
  const response = "message recieved!";
  await sendTextMessage(recipient, response);
  res.sendStatus(304);
});

module.exports = router;
