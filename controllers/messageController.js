const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const { conversationCache } = require("../utils/cache");
const { formatTag } = require("../helpers/format.helpers");
const { level1Options, locationOptions } = require("../config/database-config");
const {
  findTags,
  getLevel2Options,
  selectOptions,
} = require("../helpers/database.helpers");
const client = require("twilio")(accountSid, authToken);
const {
  createTextMessage,
  createTemplateMessage,
} = require("../helpers/messages.helpers");

async function respondToButtonMessage(recipient, buttonText) {
  console.log(buttonText);
  if (level1Options.includes(buttonText)) {
    const tags = await findTags(buttonText);
    const tagArray = tags.map((item) => item["Tag"]);
    sendTextMessage(recipient, tagArray.join(","));
  } else {
    const level2Options = await getLevel2Options();
    if (level2Options.includes(buttonText.toLowerCase())) {
      conversationCache.set("selectedLevel2Option", buttonText.toLowerCase());
      sendTextMessage(recipient, locationOptions.join(","));
    }
    if (locationOptions.includes(buttonText)) {
      let page = 1;
      const selectedLevel2Option = conversationCache.get(
        "selectedLevel2Option"
      );
      const locationSelection = buttonText.toLowerCase();
      const result = await selectOptions(
        formatTag(selectedLevel2Option),
        locationSelection,
        page
      );
      const names = result.map((options) => options["Name"]);
      for (const name of names) {
        console.log(name);
        sendTextMessage(recipient, name);
      }
    }
  }
}
async function sendTextMessage(recipient, textContent) {
  const message = createTextMessage(recipient, textContent);
  await client.messages.create(message);
}

async function sendTemplateMessage(
  recipient,
  contentSid,
  contentVariables,
  messagingServiceSid
) {
  const message = createTemplateMessage(
    recipient,
    contentSid,
    contentVariables,
    messagingServiceSid
  );
  const tmpl = await client.messages.create(message);
  console.log(tmpl);
}
module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  respondToButtonMessage,
};
