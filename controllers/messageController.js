const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const { createTextMessage } = require("../helpers/messages.helpers");

async function sendTextMessage(recipient, textContent) {
  const message = createTextMessage(recipient, textContent);
  await client.messages.create(message);
}

module.exports = {
  sendTextMessage,
};
