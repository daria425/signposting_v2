const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const app = express();
const indexRouter = require("./routes/index");
const messageRouter = require("./routes/message");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/message", messageRouter);
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
