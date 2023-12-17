const fs = require("fs");
const util = require("util");
const path = require("path");
const net = require("net");
const PJLink = require("pjlink");

const { exec, spawn } = require("child_process");

var DEBUG = process.env.DEBUG != "true" ? false : true;
var BEAMER_IP = process.env.BEAMER_IP || "0.0.0.0";

var beamerArray = [];

const delay = (time) => new Promise((res) => setTimeout(res, time));

function sendSerialProjector(stringSend, Address) {
  return new Promise((resolve, reject) => {
    const hexData = Buffer.from(stringSend, "hex");
    console.log("[SERIAL] Sending data to target(" + Address + "): " + stringSend);
    const client = net.createConnection({ host: Address, port: 23 }, () => {
      if (DEBUG) console.log("[SERIAL] Connected to target.");
      client.write(hexData);
    });
    client.on("data", (data) => {
      client.end();
    });
    client.on("end", () => {
      if (DEBUG) console.log("[SERIAL] Disconnected from target.");
      resolve(true);
    });
    client.on("error", (err) => {
      console.error("[SERIAL] Error:", err.message);
      resolve(false);
    });
  });
}

function IsJsonString(str) {
  var result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return str;
  }
  return result;
}
function execAwait(command) {
  return new Promise((resolve, reject) => {
    console.log("[RUN] " + command);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`[RUN] error: ${error}`);
        //resolve({ error: error, data: undefined });
        //return;
      }
      if (stderr) {
        resolve({ error: stderr, data: undefined });
        return;
      }
      resolve({ error: undefined, data: stdout });
    });
  });
}

//https://docs.balena.io/reference/supervisor/supervisor-api/
function getBalenaRelease() {
  return new Promise((resolve, reject) => {
    exec(
      'curl -X GET --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v1/device?apikey=$BALENA_SUPERVISOR_API_KEY"',
      (error, stdout, stderr) => {
        if (error) {
          //console.log(`error: ${error.message}`);
          resolve(false);
          return;
        }
        if (stderr) {
          //console.log(`stderr: ${stderr}`);
          //resolve(stderr);
          //return;
        }
        resolve(IsJsonString(stdout));
      }
    );
  });
}

function getBalenaName() {
  return new Promise((resolve, reject) => {
    exec(
      'curl -X GET --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v2/device/name?apikey=$BALENA_SUPERVISOR_API_KEY"',
      (error, stdout, stderr) => {
        if (error) {
          //console.log(`error: ${error.message}`);
          resolve(false);
          return;
        }
        if (stderr) {
          //console.log(`stderr: ${stderr}`);
          //resolve(stderr);
          //return;
        }
        resolve(IsJsonString(stdout));
      }
    );
  });
}

function pjlinkSet(ip, command) {
  return new Promise(async (resolve, reject) => {
    const projector = new PJLink(ip, 4352);
    if (command == "on") {
      projector.powerOn(function (err) {
        if (err) {
          console.log("[PJLINK] error turning on", err);
          resolve(false);
          return;
        }
        console.log("[PJLINK] turned on: " + ip);
        resolve(true);
      });
    }
    if (command == "off") {
      projector.powerOff(function (err) {
        if (err) {
          console.log("[PJLINK] error turning on", err);
          resolve(false);
          return;
        }
        console.log("[PJLINK] turned on: " + ip);
        resolve(true);
      });
    }
  });
}

module.exports = {
  init: function () {
    beamerArray = BEAMER_IP.split(",");
    console.log("[INIT] Beamer defined: " + beamerArray);
  },

  setScreenPower: async function (powerState, screenNumber = 0, ddc = false) {
    return new Promise(async (resolve, reject) => {
      //DISPLAY=:0 xset dpms force off
      monitorStates = {
        off: "05",
        standby: "03",
        on: "01",
      };
      let setPowerState;
      let setXState;

      if (powerState == "on") {
        setPowerState = monitorStates.on;
        setXState = "auto";
      }
      if (powerState == "off") {
        setPowerState = monitorStates.off;
        setXState = "off";
      }
      if (powerState == "standby") {
        setPowerState = monitorStates.standby;
        setXState = "off";
      }
      let ddcNumber = screenNumber + 1;
      console.log("[MONITOR] set power state to: " + setPowerState);

      let xSetResult = await execAwait("DISPLAY=:0 xrandr --output DisplayPort-" + ddcNumber + " --" + setXState);
      let xSetResult2 = await execAwait("DISPLAY=:0 xrandr --output HDMI-" + ddcNumber + " --" + setXState);

      // let xSetResult = await execAwait("DISPLAY=:0 xset dpms force " + setXState);
      if (xSetResult.error == undefined || xSetResult2.error == undefined) xSetResult = "ok";
      else {
        xSetResult = {};
        xSetResult["dp"] = xSetResult.error;
        xSetResult["hdmi"] = xSetResult2.error;
      }
      let ddcSetResult;
      if (ddc) {
        ddcSetResult = await execAwait("ddcutil setvcp --display " + ddcNumber + " D6 " + setPowerState);
        if (ddcSetResult.error == undefined) ddcSetResult = "ok";
        else ddcSetResult = ddcSetResult.error;
      }
      resolve({ xSetResult, ddcSetResult });
    });
  },

  getBalenaData: async function () {
    return new Promise(async (resolve, reject) => {
      let result = await getBalenaRelease();
      resolve(result);
    });
  },
  getBalenaName: async function () {
    return new Promise(async (resolve, reject) => {
      let result = await getBalenaName();
      resolve(result);
    });
  },

  setBalenaRestart: async function (timeout) {
    //todo: add timeout as delay
    return new Promise((resolve, reject) => {
      exec(
        'curl -X POST --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v1/reboot?apikey=$BALENA_SUPERVISOR_API_KEY"',
        (error, stdout, stderr) => {
          if (error) {
            //console.log(`error: ${error.message}`);
            resolve(false);
            return;
          }
          if (stderr) {
            //console.log(`stderr: ${stderr}`);
            //resolve(stderr);
            //return;
          }
          resolve(IsJsonString(stdout));
        }
      );
    });
  },
  setBalenaShutdown: async function (time) {
    //todo: add timeout as delay
    return new Promise((resolve, reject) => {
      exec(
        'curl -X POST --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v1/shutdown?apikey=$BALENA_SUPERVISOR_API_KEY"',
        (error, stdout, stderr) => {
          if (error) {
            //console.log(`error: ${error.message}`);
            resolve(false);
            return;
          }
          if (stderr) {
            //console.log(`stderr: ${stderr}`);
            //resolve(stderr);
            //return;
          }
          resolve(IsJsonString(stdout));
        }
      );
    });
  },
  setBalenaSleep: async function () {
    //todo: add timeout as delay
    return new Promise(async (resolve, reject) => {
      console.log(beamerArray);
      for (let index = 0; index < beamerArray.length; index++) {
        const element = beamerArray[index];
        //await sendSerialProjector("7E3030303020300D", element); //power off optoma
        await pjlinkSet(element, "off");
      }
      await execAwait("xset dpms force off");
      for (let index = 0; index < 5; index++) {
        await execAwait("DISPLAY=:0 xrandr --output DisplayPort-" + index + " --off");
        await execAwait("DISPLAY=:0 xrandr --output HDMI-" + index + " --off");
        await execAwait("ddcutil setvcp --display " + index + " D6 " + "03");
      }

      resolve("all devices sleeping");
    });
  },
  setBalenaWake: async function () {
    //todo: add timeout as delay
    return new Promise(async (resolve, reject) => {
      console.log(beamerArray);
      for (let index = 0; index < beamerArray.length; index++) {
        const element = beamerArray[index];
        //await sendSerialProjector("7E3030303020310D", element); //power on optoma
        await pjlinkSet(element, "on");
      }
      await execAwait("xset dpms force on");
      for (let index = 0; index < 5; index++) {
        await execAwait("DISPLAY=:0 xrandr --output DisplayPort-" + index + " --auto");
        await execAwait("DISPLAY=:0 xrandr --output HDMI-" + index + " --auto");
        await execAwait("ddcutil setvcp --display " + index + " D6 " + "01");
      }
      await this.setBalenaRestart();

      resolve("all devices awake");
    });
  },
  getMonitorStatus: async function () {
    return new Promise(async (resolve, reject) => {
      let ddcResult = await execAwait("ddcutil capabilities");
      let xResult = await execAwait("DISPLAY=:0 xrandr -q");

      resolve({ ddcResult: ddcResult.data, xResult: xResult.data });
    });
  },
  getDisplayCount: async function () {
    return new Promise(async (resolve, reject) => {
      let displayCount = await execAwait("xrandr --query | grep ' connected' | wc -l | tr -d '\n'");
      resolve(displayCount);
    });
  },
  getDisplayPing: async function (displayNumber = 0) {
    return new Promise(async (resolve, reject) => {
      let pingResult = await execAwait("ddcutil -d " + displayNumber + " getvcp 10");
      if (pingResult.error == undefined) pingResult = "ok";
      else pingResult = "offline";
      console.log(pingResult);

      resolve(pingResult);
    });
  },

  test: async function () {
    return new Promise(async (resolve, reject) => {
      resolve(result);
    });
  },
};
