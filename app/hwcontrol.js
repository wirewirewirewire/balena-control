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
  init: function () {},

  setMonitorPower: async function (powerState) {
    return new Promise(async (resolve, reject) => {
      monitorStates = {
        off: "05",
        standby: "04",
        on: "01",
      };
      let setPowerState;

      if (powerState == "on") setPowerState = monitorStates.on;
      if (powerState == "off") setPowerState = monitorStates.off;
      if (powerState == "standby") setPowerState = monitorStates.standby;

      console.log("[MONITOR] set power state to: " + setPowerState);

      return new Promise((resolve, reject) => {
        exec("ddcutil setvcp D6 " + setPowerState, (error, stdout, stderr) => {
          if (error) {
            resolve(false);
            return;
          }
          if (stderr) {
            console.log(`[MONITOR] stderr: ${stderr}`);
            resolve(false);
          }
          resolve(stdout);
        });
      });
    });
  },

  getBalenaData: async function () {
    return new Promise(async (resolve, reject) => {
      let result = await getBalenaRelease();
      resolve(result);
    });
  },

  setBalenaRestart: async function () {
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
  setBalenaShutdown: async function () {
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
  getMonitorStatus: async function () {
    return new Promise(async (resolve, reject) => {
      exec("ddcutil capabilities", (error, stdout, stderr) => {
        if (error) {
          resolve(false);
          return;
        }
        if (stderr) {
        }
        resolve(stdout);
      });
    });
  },

  test: async function () {
    return new Promise(async (resolve, reject) => {
      resolve(result);
    });
  },
};
