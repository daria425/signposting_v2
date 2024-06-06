const express = require("express");
const router = express.Router();
const {
  listTemplates,
  createTemplate,
} = require("../helpers/twilio_api.helpers");

router.get("/templates", async (req, res, next) => {
  const templates = await listTemplates();
  res.status(200).send(templates);
});

module.exports = router;
