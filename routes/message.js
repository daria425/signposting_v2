const express = require("express");
const { twilioConfig } = require("../config/twilio-config");
const {
  sendTextMessage,
  respondToButtonMessage,
} = require("../controllers/messageController");
const { getLevel2Options } = require("../helpers/database.helpers");
const router = express.Router();

router.post("/", async (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  console.log(body);
  const recipient = body.WaId;
  const messageType = body.MessageType;
  if (messageType === "button") {
    const buttonText = body.ButtonText;
    await respondToButtonMessage(recipient, buttonText);
  }
  res.sendStatus(304);
});

module.exports = router;
