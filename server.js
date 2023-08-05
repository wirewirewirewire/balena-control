// server.js
//require("console-stamp")(console, "[HH:MM:ss.l]");
//require("dotenv").config();
const fs = require("fs");
const util = require("util");
const path = require("path");
const morgan = require("morgan");
const express = require("express");
var app = express();

const httpServer = require("http").createServer(app);
const httpApp = express();

var DEBUG = process.env.DEBUG != "true" ? false : true;
var RUN_DRY = false;

var PORT = process.env.BALENA_CONTROL_PORT || 3009;
var TOKEN = process.env.BALENA_CONTROL_TOKEN || undefined;
var DISPLAY_COUNT = process.env.BALENA_DISPLAY_COUNT || 1;
var DISPLAY_COUNT = process.env.BALENA_DISPLAY_COUNT || 1;

// configuration ===============================================================
console.log("[Server] Start API Server");
if (!TOKEN || TOKEN == "" || TOKEN == "null" || TOKEN == undefined) {
  console.log("[Server] No Token Set, API is not secure!");
}

if (DEBUG) {
  var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
    flags: "a",
  });
  app.use(morgan("combined", { stream: accessLogStream }));
}

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// routes ======================================================================
require("./app/routes.js")(app); // load our routes

httpServer.listen(PORT, () => {
  console.log("[Server] http control api : " + httpServer.address().address + ":" + PORT);
});

process.on("SIGINT", () => {
  console.log("Bye bye!");
  process.exit();
});
