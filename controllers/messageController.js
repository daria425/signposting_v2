const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const { conversationCache } = require("../utils/cache");
const { formatTag } = require("../helpers/format.helpers");
const { findTemplateSid } = require("../helpers/twilio_api.helpers");
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

async function beginSignpostingFlow(recipient) {
  const templateVariables = {
    greeting: "Hello",
  };
  const contentSid = "HX279e99f6cd78c32d9d5e152ae1b68f5c";
  await sendTemplateMessage(recipient, contentSid, templateVariables);
}

async function signpostingStep2(recipient, contentSid) {
  const templateVariables = {
    select_further_options:
      "Thank you, please select a further option from the below",
  };
  await sendTemplateMessage(recipient, contentSid, templateVariables);
}

async function sendLocationChoiceMessage(recipient) {
  const templateVariables = {
    location_choice_message:
      "Thank you, would you like to see local options, national options or both?",
  };
  const contentSid = "HX150ba1af61e7fdf5423faefe1dc70cec";
  await sendTemplateMessage(recipient, contentSid, templateVariables);
}

async function respondToListMessage(recipient, listId) {
  if (level1Options.includes(listId)) {
    const contentSid = await findTemplateSid(listId);
    await signpostingStep2(recipient, contentSid);
  } else {
    const level2Options = await getLevel2Options();
    if (level2Options.includes(listId)) {
      conversationCache.set("selectedLevel2Option", listId);
      await sendLocationChoiceMessage(recipient);
    }
  }
}

async function sendOptions(recipient, buttonPayload) {
  let page = 1;
  const selectedLevel2Option = conversationCache.get("selectedLevel2Option");
  console.log(selectedLevel2Option);
  const locationSelection = buttonPayload.toLowerCase();
  const result = await selectOptions(
    formatTag(selectedLevel2Option),
    locationSelection,
    page
  );
  console.log(result);
  const variableArray = result.map((option) => ({
    option_description: option["Short text description"],
    option_image_url: option["Logo-link"].replace(
      "https://drive.google.com/",
      ""
    ),
    option_location_type: "Location",
    option_location_value: option["Local / National"],
    option_name: option["Name"],
    option_website: option["Website"],
  }));
  for (const variables of variableArray) {
    const contentSid = "HX923eb636865141dd251ddc67e2a1e216";
    await sendTemplateMessage(recipient, contentSid, variables);
  }
}

async function sendTextMessage(recipient, textContent) {
  const message = createTextMessage(recipient, textContent);
  await client.messages.create(message);
}

async function sendTemplateMessage(recipient, contentSid, contentVariables) {
  const message = createTemplateMessage(
    recipient,
    contentSid,
    contentVariables
  );
  const tmpl = await client.messages.create(message);
  console.log(tmpl);
}
module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  respondToListMessage,
  signpostingStep2,
  beginSignpostingFlow,
  sendOptions,
};
