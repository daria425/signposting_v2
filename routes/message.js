const express = require("express");
const {
  beginSignpostingFlow,
  beginOnboardingFlow,
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
    if (text === "hi") {
      conversationCache.flushAll();
      conversationCache.set("flow", "signposting", 3600);
      await beginSignpostingFlow(recipient);
    } else if (text === "start") {
      conversationCache.flushAll();
      conversationCache.set("flow", "onboarding", 3600);
      await beginOnboardingFlow(recipient);
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
