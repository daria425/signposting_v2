const express = require("express");
const { twilioConfig } = require("../config/twilio-config");
const {
  selectFlow,
  respondToListMessage,
  respondToButtonMessage,
  handleConversationMessages,
} = require("../controllers/messageController");
const { conversationCache } = require("../utils/cache");
const { getUser } = require("../helpers/database.helpers");

const router = express.Router();

router.post("/", async (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  console.log(body);
  const recipient = body.WaId;
  const messageType = body.MessageType;
  const messageBody = body.Body;
  const recipientProfileName = body.ProfileName;
  const registeredUser = await getUser(recipient);
  console.log(registeredUser);
  if (messageType === "text") {
    const text = messageBody.toLowerCase();
    if (twilioConfig.flowTriggers.includes(text) || !registeredUser) {
      await selectFlow(recipient, text, registeredUser);
    } else {
      const flow = conversationCache.get("flow");
      await handleConversationMessages(recipient, flow, messageBody);
    }
  } else if (messageType === "interactive" || messageType === "button") {
    const listId = body.ListId;
    const buttonPayload = body.ButtonPayload;
    if (listId) {
      await respondToListMessage(recipient, listId);
    } else if (buttonPayload) {
      await respondToButtonMessage(
        recipient,
        recipientProfileName,
        buttonPayload
      );
    }
  }
  res.sendStatus(304);
});

module.exports = router;
