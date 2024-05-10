function formatTag(str) {
  return "#" + str.replace(/ /g, "-");
}

module.exports = { formatTag };
