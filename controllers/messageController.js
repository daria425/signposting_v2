const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const { conversationCache } = require("../utils/cache");
const { formatTag } = require("../helpers/format.helpers");
const { findTemplateSid } = require("../helpers/twilio_api.helpers");
const {
  level1Options,
  locationOptions,
  seeMoreOptionsValues,
} = require("../config/button-config");
const {
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
    greeting: "Welcome, please select a category below to see support options",
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

async function respondToButtonMessage(recipient, buttonPayload) {
  if (locationOptions.includes(buttonPayload)) {
    await sendOptions(recipient, buttonPayload);
  } else if (seeMoreOptionsValues.includes(buttonPayload)) {
    if (buttonPayload === "see-more") {
      await sendOptions(recipient, undefined, true);
    }
  }
}

async function sendOptions(
  recipient,
  buttonPayload,
  useCachedSelection = false
) {
  const selectedLevel2Option = conversationCache.get("selectedLevel2Option");
  if (!selectedLevel2Option) {
    await sendTextMessage(recipient, "Please specify a category first");
    return;
  } else {
    const pageSize = 5;
    let page = conversationCache.get("page");
    if (page == undefined) {
      page = 1;
    }
    conversationCache.set("page", page + 1);
    let locationSelection;
    if (useCachedSelection) {
      locationSelection = conversationCache.get("location-selection");
    } else {
      locationSelection = buttonPayload.toLowerCase();
      conversationCache.set("location-selection", locationSelection);
    }
    const { result, remaining } = await selectOptions(
      formatTag(selectedLevel2Option),
      locationSelection,
      page
    );
    const moreOptionsAvailable = remaining > pageSize;
    conversationCache.set("more-options-available", moreOptionsAvailable);
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
    console.log(variableArray);
    for (const [index, value] of variableArray.entries()) {
      const contentSid = "HX923eb636865141dd251ddc67e2a1e216";
      await sendTemplateMessage(
        recipient,
        contentSid,
        value,
        index,
        variableArray.length
      );
    }
  }
}

async function sendLastOptionMessage(recipient, moreOptionsAvailable) {
  if (moreOptionsAvailable) {
    const contentSid = "HX31992901024acd003249c56f412fba4f";
    await sendTemplateMessage(recipient, contentSid);
  } else {
    const text =
      "Thanks for using the service just now, please text 'hi' to search again";
    await sendTextMessage(recipient, text);
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
  index = 0,
  trackedArrayLength = null
) {
  const message = createTemplateMessage(
    recipient,
    contentSid,
    contentVariables
  );
  const template = await client.messages.create(message);
  if (trackedArrayLength && index === trackedArrayLength - 1) {
    conversationCache.set("last-template", template.sid);
  }
}
module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  respondToListMessage,
  signpostingStep2,
  beginSignpostingFlow,
  respondToButtonMessage,
  sendLastOptionMessage,
};
