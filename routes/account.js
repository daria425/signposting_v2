const express = require("express");
const router = express.Router();
const {
  listTemplates,
  listMessages,
} = require("../helpers/twilio_api.helpers");

router.get("/templates", async (req, res, next) => {
  const templates = await listTemplates();
  res.status(200).send(templates);
});

router.get("/messages", async (req, res, next) => {
  const messages = await listMessages();
  res.status(200).send(messages);
});

module.exports = router;
