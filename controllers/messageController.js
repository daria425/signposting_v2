const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const { User } = require("../models/user");
const { conversationCache } = require("../utils/cache");
const { formatTag, formatButtonId } = require("../helpers/format.helpers");
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
const { saveUser, updateUser } = require("../helpers/database.helpers");
async function beginSignpostingFlow(recipient) {
  const templateVariables = {
    greeting: "Welcome, please select a category below to see support options",
  };
  const contentSid = "HX279e99f6cd78c32d9d5e152ae1b68f5c";
  await sendTemplateMessage(recipient, contentSid, templateVariables);
}

async function beginOnboardingFlow(recipient) {
  const contentSid = "HX90723e1871ae77cc82e1e3277c798894";
  await sendTemplateMessage(recipient, contentSid);
}

async function selectFlow(recipient, text, registeredUser) {
  console.log(!registeredUser);
  if (text === "hi" && registeredUser) {
    conversationCache.flushAll();
    conversationCache.set("flow", "signposting", 3600);
    await beginSignpostingFlow(recipient);
  } else if (text === "start" || !registeredUser) {
    conversationCache.flushAll();
    conversationCache.set("flow", "onboarding", 3600);
    console.log("flow should begin");
    await beginOnboardingFlow(recipient);
  }
}
async function signpostingStep2(recipient, contentSid) {
  const templateVariables = {
    select_further_options:
      "Thank you, please select a further option from the below",
  };
  await sendTemplateMessage(recipient, contentSid, templateVariables);
}

async function handleConversationMessages(recipient, flow, messageBody) {
  if (flow) {
    if (flow === "onboarding") {
      const flowStep = Number(conversationCache.get("flowStep"));
      const userData = conversationCache.get("user");
      console.log(flowStep);
      if (flowStep == 1) {
        const username = messageBody;
        conversationCache.set("user", {
          ...userData,
          username: username,
          opted_in: false,
          completed_onboarding: false,
        });
        const textContent = `Nice to meet you ${username}!
      Step 2 of 3: To ensure we have the right information could you
      share the name of the organisation you work for?`;
        conversationCache.set("flowStep", flowStep + 1);
        await sendTextMessage(recipient, textContent);
      } else if (flowStep == 2) {
        const organisation = messageBody;
        const userData = conversationCache.get("user");
        userData.organisation = organisation;
        conversationCache.mset([
          { key: "user", val: userData },
          { key: "flowStep", val: flowStep + 1 },
        ]);
        const textContent =
          "Step 3 of 3: Great, to better assist you could you let us know the postcode you will be seeking support around?";
        await sendTextMessage(recipient, textContent);
      } else if (flowStep == 3) {
        const userData = conversationCache.get("user");
        const postcode = messageBody;
        userData.postcode = postcode;
        conversationCache.mset([
          { key: "user", val: userData },
          { key: "flowStep", val: flowStep + 1 },
        ]);
        const contentSid = "HX3a7e836d31150df6bd0354ac316fc799";
        await sendTemplateMessage(recipient, contentSid);
      }
    }
  }
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
  if (level1Options["english"].includes(listId)) {
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

async function respondToButtonMessage(
  recipient,
  recipientProfileName,
  buttonPayload
) {
  if (locationOptions.includes(buttonPayload)) {
    await sendOptions(recipient, buttonPayload);
  } else if (seeMoreOptionsValues.includes(buttonPayload)) {
    if (buttonPayload === "see-more") {
      await sendOptions(recipient, undefined, true);
    }
  } else {
    const { flowName, flowStep } = formatButtonId(buttonPayload);
    console.log(flowName, flowStep);
    if (flowName === "onboarding") {
      if (flowStep == 1) {
        conversationCache.set("flowStep", flowStep);
        const textContent = "Step 1 of 3: To begin, what is your name?";
        const userData = {
          "WaId": recipient,
          "ProfileName": recipientProfileName,
        };
        conversationCache.set("user", userData);
        await saveUser(userData);
        await sendTextMessage(recipient, textContent);
      } else if (flowStep == 4) {
        const user = conversationCache.get("user");
        (user.opted_in = true), (user.completed_onboarding = true);
        const newUser = new User(
          user.username,
          user.ProfileName,
          user.WaId,
          user.organisation,
          user.postcode,
          user.completed_onboarding,
          user.opted_in
        );
        await updateUser(recipient, newUser);
        await beginSignpostingFlow(user.WaId);
      }
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
    const moreOptionsAvailable = remaining >= pageSize;
    conversationCache.set("more-options-available", moreOptionsAvailable);
    const variableArray = result.map((option) => ({
      option_description: option["Short text description"],
      option_image_url: option["Logo-link"].replace(
        "https://drive.google.com/",
        ""
      ),
      option_location_type:
        option["Local / National"] === "National" ? "Location" : "Postcode",
      option_location_value:
        option["Local / National"] === "National"
          ? "National"
          : option["Postcode"],
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
  beginOnboardingFlow,
  handleConversationMessages,
  selectFlow,
};
