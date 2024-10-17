var control = require("./hwcontrol");

var DEBUG = true;

module.exports = function (app) {
  app.get("/status", async function (req, res) {
    if (DEBUG) console.log("[API] get status");
    var balenaData = await control.getBalenaData();
    var deviceName = await control.getBalenaName();
    if (deviceName.hasOwnProperty("deviceName")) deviceName = deviceName.deviceName;
    //var screenData = await control.getMonitorStatus();
    var appName = process.env.BALENA_APP_NAME;
    var deviceType = process.env.BALENA_DEVICE_TYPE;
    var deviceUUID = process.env.BALENA_DEVICE_UUID;
    var pjlinkState = await control.getPjlinkState();
    res.send({ success: true, error: null, data: { balenaData, appName, deviceName, deviceType, deviceUUID, pjlinkState } });
  });
  app.post("/shutdown", async function (req, res) {
    if (DEBUG) console.log("[API] post shutdown");
    var timeout;
    let status = await control.setBalenaShutdown(timeout);
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: status.Data, data: status.Data });
  });

  app.post("/reboot", async function (req, res) {
    console.log("[API] post reboot");
    var timeout;
    let status = await control.setBalenaRestart(timeout);
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: status.Data });
  });
  app.post("/sleep", async function (req, res) {
    console.log("[API] post sleep");
    let status = await control.setBalenaSleep();
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: { status } });
  });
  app.post("/wake", async function (req, res) {
    console.log("[API] post wake");
    let status = await control.setBalenaWake();
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: { status } });
  });

  app.get("/reboot", async function (req, res) {
    console.log("[API] get reboot");
    res.send({ success: false, error: "please use POST request", data: true });
  });
  app.get("/sleep", async function (req, res) {
    console.log("[API] get sleep");
    res.send({ success: false, error: "please use POST request", data: true });
  });
  app.get("/wake", async function (req, res) {
    console.log("[API] get wake");
    res.send({ success: false, error: "please use POST request", data: true });
  });

  app.get("/display", async function (req, res) {
    if (DEBUG) console.log("[API] get display");
    if (DEBUG) console.log(req.body);
    var result = [];
    for (var i = 0; i < 4; i++) {
      let data = req.body[i];
      let status = await control.getDisplayPing(i);
      result.push({ display: i, data: status });
    }
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: result });
  });
  app.post("/display", async function (req, res) {
    if (DEBUG) console.log("[API] post display");
    if (DEBUG) console.log(req.body);
    var result = [];
    for (var i = 0; i < req.body.length; i++) {
      let data = req.body[i];
      let ddc = false;
      if (req.body[i].hasOwnProperty("ddc")) {
        if (req.body[i].ddc === true || req.body[i].ddc == "true") {
          ddc = true;
        }
      }
      let funcResult = await control.setScreenPower(data.status, data.display, ddc);
      result.push({ display: i, data: funcResult });
    }
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: result });
  });
};
