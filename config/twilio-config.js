const twilioConfig = {
  serviceNumber: "whatsapp:+14155238886",
  templates: [
    {
      messagingServiceSid: "MG6ae116c0a855b489df810304a95f843d",
      name: "signposting_welcome",
      contentSid: "HXbe24e00dfc40224478249cf82149c0ef",
      contentVariables: {
        welcomeMessageText:
          "Welcome, please select a category below to see support options.",
      },
    },
  ],
};

module.exports = { twilioConfig };
