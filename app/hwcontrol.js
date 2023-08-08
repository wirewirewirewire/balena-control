const fs = require("fs");
const util = require("util");
const path = require("path");

const { exec, spawn } = require("child_process");

var DEBUG = process.env.DEBUG != "true" ? false : true;

const delay = (time) => new Promise((res) => setTimeout(res, time));

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

module.exports = {
  init: function () { },

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
        xSetResult["dp"] = xSetResult.error
        xSetResult["hdmi"] = xSetResult2.error
      }
      let ddcSetResult
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
  setBalenaSleep: async function (sleepTime) {
    //todo: add timeout as delay
    return new Promise((resolve, reject) => {
      resolve("not implemented now");
    });
  },
  getMonitorStatus: async function () {
    return new Promise(async (resolve, reject) => {
      let ddcResult = await execAwait("ddcutil capabilities")
      let xResult = await execAwait("DISPLAY=:0 xrandr -q")

      resolve({ddcResult: ddcResult.data, xResult:xResult.data})
    });
  },

  test: async function () {
    return new Promise(async (resolve, reject) => {
      resolve(result);
    });
  },
};
