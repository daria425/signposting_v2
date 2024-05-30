const express = require("express");
const { twilioConfig } = require("../config/twilio-config");
const {
  selectFlow,
  respondToListMessage,
  respondToButtonMessage,
  handleConversationMessages,
} = require("../controllers/messageController");
const { conversationCache } = require("../utils/cache");

const router = express.Router();

router.post("/", async (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  console.log(body);
  const recipient = body.WaId;
  const messageType = body.MessageType;
  const messageBody = body.Body;

  if (messageType === "text") {
    const text = messageBody.toLowerCase();
    if (twilioConfig.flowTriggers.includes(text)) {
      selectFlow(recipient, text);
    } else {
      const flow = conversationCache.get("flow");
      handleConversationMessages(recipient, flow, messageBody);
    }
  } else if (messageType === "interactive" || messageType === "button") {
    const listId = body.ListId;
    const buttonPayload = body.ButtonPayload;
    if (listId) {
      await respondToListMessage(recipient, listId);
    } else if (buttonPayload) {
      await respondToButtonMessage(recipient, buttonPayload);
    }
  }
  res.sendStatus(304);
});

module.exports = router;
