const express = require("express");
const router = express.Router();
const { formatContact } = require("../helpers/format.helpers");
const { sendLastOptionMessage } = require("../controllers/messageController");
const { conversationCache } = require("../utils/cache");
router.post("/", async (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  if (body.MessageStatus === "delivered") {
    const templateSid = body.MessageSid;
    const contact = body.To;
    const recipient = formatContact(contact);
    const lastMessageSid = conversationCache.get("last-template");
    if (lastMessageSid && lastMessageSid === templateSid) {
      const moreOptionsAvailable = conversationCache.get(
        "more-options-available"
      );
      await sendLastOptionMessage(recipient, moreOptionsAvailable);
    }
  }
  res.sendStatus(304);
});

module.exports = router;
