var control = require("./hwcontrol");

control.init();

var DEBUG = true;

module.exports = function (app) {
  app.get("/status", async function (req, res) {
    if (DEBUG) console.log("[API] get status");
    var balenaData = await control.getBalenaData();
    var screenData = await control.getMonitorStatus();
    var sleepState;
    var displayState; //on,off,mixed
    res.send({ success: true, error: null, data: { balenaData, screenData } });
  });
  app.post("/shutdown", async function (req, res) {
    if (DEBUG) console.log("[API] post shutdown");
    var timeout;
    let status = await control.setBalenaShutdown(timeout);
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: status.Data, data: status.Data });
  });
  app.post("/reboot", async function (req, res) {
    if (DEBUG) console.log("[API] post reboot");
    var timeout;
    let status = await control.setBalenaRestart(timeout);
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: status.Data });
  });
  app.post("/sleep", async function (req, res) {
    if (DEBUG) console.log("[API] post sleep");
    var sleepLength;
    let status = await control.setBalenaSleep(sleepLength);
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: { status } });
  });
  app.post("/display", async function (req, res) {
    if (DEBUG) console.log("[API] post display");
    if (DEBUG) console.log(req.body);
    var result = [];
    for (var i = 0; i < req.body.length; i++) {
      let data = req.body[i];
      let ddc = false
      if (req.body[i].hasOwnProperty("ddc")) {
        if (req.body[i].ddc === true || req.body[i].ddc == "true") {
        ddc = true
        }
    }
      let funcResult = await control.setScreenPower(data.status, data.display, ddc);
      result.push({ display: i, data: funcResult });
    }
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, error: null, data: result });
  });
};
