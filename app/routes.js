var control = require("./hwcontrol");

control.init();

module.exports = function (app) {
  app.get("/status", async function (req, res) {
    var balenaData = await control.getBalenaData();
    var screenData = await control.getMonitorStatus();
    var speep;
    var display; //on,off,mixed
    res.send({ success: true, _error: null, data: { balenaData, screenData } });
  });
  app.get("/status", async function (req, res) {
    res.send({ success: true, _error: null, data: {} });
  });
  app.post("/shutdown", async function (req, res) {
    var timeout;
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, _error: null, data: { status: null } });
  });
  app.post("/reboot", async function (req, res) {
    var timeout;
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, _error: null, data: { status: null } });
  });
  app.post("/sleep", async function (req, res) {
    var sleepLength;
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, _error: null, data: { status: null } });
  });
  app.post("/display", async function (req, res) {
    var displayNumber;
    var setState;
    //let file = req.files[Object.keys(req.files)[0]].tempFilePath;
    res.send({ success: true, _error: null, data: { display: null, status: null } });
  });
};
