const { twilioConfig } = require("../config/twilio-config");
const messagingServiceSid = twilioConfig.messagingServiceSid;
const createTextMessage = (recipient, textContent) => {
  const message = {
    from: messagingServiceSid,
    body: textContent,
    to: `whatsapp:+${recipient}`,
  };
  return message;
};

const createTemplateMessage = (recipient, contentSid, templateVariables) => {
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
