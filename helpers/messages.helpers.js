const { twilioConfig } = require("../config/twilio-config");
const serviceNumber = twilioConfig.serviceNumber;
const createTextMessage = (recipient, textContent) => {
  const message = {
    from: serviceNumber,
    body: textContent,
    to: `whatsapp:+${recipient}`,
  };
  return message;
};

module.exports = {
  createTextMessage,
};
