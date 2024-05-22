function formatTag(str) {
  return "#" + str.replace(/ /g, "-");
}

function convertTemplateName(templateName) {
  // Convert string to lowercase
  let result = templateName.toLowerCase();

  // Replace spaces with underscores
  result = result.replace(/\s+/g, "_");

  // Remove non-alphanumeric characters except underscores
  result = result.replace(/[^\w\s]/gi, "");

  // Remove any trailing underscores
  result = result.replace(/_+$/, "");
  console.log(result);
  return result;
}

function formatContact(contact) {
  return contact.replace("whatsapp:", "");
}
module.exports = { formatTag, convertTemplateName, formatContact };
