const twilioConfig = {
  serviceNumber: process.env.TWILIO_PHONE_NUMBER,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  flowTriggers: ["hi", "start"],
  flowMessages: {
    onBoarding: {
      stepOne: {
        english: "Step 1 of 3: To begin, what is your name?",
        french: "Étape 1 sur 3 : Pour commencer, quel est votre nom?",
      },
      stepTwo(name, language) {
        if (language === "english") {
          return `Nice to meet you ${name}!
          Step 2 of 3: To ensure we have the right information could you
          share the name of the organisation you work for?`;
        } else if (language === "french") {
          return `Ravi de vous rencontrer ${name} !
          Étape 2 sur 3 : Pour garantir que nous disposons des bonnes informations, pourriez-vous
          partagez le nom de l’organisation pour laquelle vous travaillez?`;
        }
      },
      stepThree: {
        english:
          "Step 3 of 3: Great, to better assist you could you let us know the postcode you will be seeking support around?",
        french:
          "Étape 3 sur 3 : Très bien, pour mieux vous aider, pourriez-vous nous indiquer le code postal pour lequel vous recherchez de l'aide?",
      },
      stepFour: {
        english: "HX3a7e836d31150df6bd0354ac316fc799",
        french: "HX9b4c29fcc1a3f9104d4c41ee56bfe2ca",
      },
    },
    signposting: {
      stepOne: {
        english: {
          greeting:
            "Welcome, please select a category below to see support options",
          templateSid: "HX279e99f6cd78c32d9d5e152ae1b68f5c",
        },
        french: {
          greeting:
            "Bienvenue, veuillez sélectionner une catégorie ci-dessous pour voir les options d'assistance.",
          templateSid: "HX8bb6ba44b9a567b9427ff7dba2367409",
        },
      },
    },
  },
};

module.exports = { twilioConfig };
