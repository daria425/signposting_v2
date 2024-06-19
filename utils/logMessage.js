const fs = require("fs");
const path = require("path");
function logMessageAsJSON(message) {
  const filePath = path.join(__dirname, "..", "tests", "test-message.json");
  let messages = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    if (data) {
      messages = JSON.parse(data);
    }
  }

  // Append the new message
  messages.push(message);

  // Write the updated messages back to the file
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  console.log("message logges");
}

module.exports = { logMessageAsJSON };
