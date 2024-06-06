const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const axios = require("axios");
const { convertTemplateName } = require("./format.helpers");
async function listTemplates() {
  const auth = {
    username: accountSid,
    password: authToken,
  };

  const response = await axios.get("https://content.twilio.com/v1/Content", {
    auth,
  });
  return response.data;
}

async function findTemplateSid(templateName) {
  try {
    const templates = await listTemplates();
    const foundTemplate = templates.contents.find(
      (template) => template.friendly_name === convertTemplateName(templateName)
    );
    if (foundTemplate) {
      return foundTemplate.sid;
    } else {
      throw new Error("Template not found");
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function createTemplate(template) {
  const auth = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  };
  const url = "https://content.twilio.com/v1/Content";
  try {
    const response = await axios.post(url, template, {
      auth: auth,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response data:", response.data);
  } catch (error) {
    console.error(
      "Error creating content:",
      error.response ? error.response.data : error.message
    );
  }
}

module.exports = { listTemplates, findTemplateSid, createTemplate };
