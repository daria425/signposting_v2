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

const createTemplateMessage = (
  recipient,
  contentSid,
  templateVariables,
  messagingServiceSid
) => {
  const message = {
    from: messagingServiceSid,
    contentSid: contentSid,
    contentVariables: JSON.stringify(templateVariables),
    to: `whatsapp:+${recipient}`,
    // messagingServiceSid: messagingServiceSid,
  };
  return message;
};
module.exports = {
  createTextMessage,
  createTemplateMessage,
};
