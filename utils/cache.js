const NodeCache = require("node-cache");
const conversationCache = new NodeCache({ stdTTL: 3600 * 24 });

module.exports = { conversationCache };
