const twilioConfig = {
  serviceNumber: process.env.TWILIO_PHONE_NUMBER,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
};

module.exports = { twilioConfig };
