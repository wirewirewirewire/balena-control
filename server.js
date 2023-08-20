// server.js
//require("console-stamp")(console, "[HH:MM:ss.l]");
//require("dotenv").config();
const fs = require("fs");
const util = require("util");
const path = require("path");
const morgan = require("morgan");
const express = require("express");
const os = require("os");
const { readFile, unlink } = require("fs").promises;
const { spawn } = require("child_process");

var app = express();
var app2 = express();

const httpServer = require("http").createServer(app);
const httpServer2 = require("http").createServer(app2);

var DEBUG = process.env.DEBUG != "true" ? false : true;
var RUN_DRY = false;

var PORT = process.env.CONTROL_PORT || 3009;
var PORT2 = process.env.XSERVER_PORT || 3005;

var TOKEN = process.env.CONTROL_TOKEN || undefined;
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

app2.get("/", async (req, res) => {
  console.log("[SCREENSHOT] Screenshot request received.");
  const fileName = process.hrtime.bigint() + ".png";
  const filePath = path.join(os.tmpdir(), fileName);
  try {
    const child = spawn("scrot", [filePath]);

    const statusCode = await new Promise((res, rej) => {
      child.on("close", res);
    });
    if (statusCode != 0) {
      return res.status(500).send("command exited with non-zero return code.");
    }

    const fileContents = await readFile(filePath);
    res.set("Content-Type", "image/png");
    return res.status(200).send(fileContents);
  } catch (e) {
    console.log("[SCREENSHOT] ERROR:");
    console.log(e.toString());
    return res.status(500).send("Error occurred in screenshot code.");
  } finally {
    try {
      await unlink(filePath);
    } catch (e) {
      console.log("[SCREENSHOT] ERROR:");
      console.log(e);
    }
  }
});

httpServer.listen(PORT, () => {
  console.log("[Server] http control api : " + httpServer.address().address + ":" + PORT);
});

httpServer2.listen(PORT2, () => {
  console.log("[Server] http screenshot api : " + httpServer2.address().address + ":" + PORT2 + "/screenshot");
});

process.on("SIGINT", () => {
  console.log("Bye bye!");
  process.exit();
});
