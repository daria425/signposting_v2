const express = require("express");
const {
  beginSignpostingFlow,
  respondToListMessage,
  respondToButtonMessage,
} = require("../controllers/messageController");
const { conversationCache } = require("../utils/cache");

const router = express.Router();

router.post("/", async (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  console.log(body);
  const recipient = body.WaId;
  const messageType = body.MessageType;
  const messageBody = body.Body;
  if (messageType === "text" && messageBody.toLowerCase() == "hi") {
    conversationCache.flushAll();
    await beginSignpostingFlow(recipient);
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
