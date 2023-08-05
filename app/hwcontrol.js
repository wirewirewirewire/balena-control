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

function setMonitorPower(powerState) {
  return new Promise((resolve, reject) => {});
}

module.exports = {
  init: function () {},

  getBalenaData: async function () {
    return new Promise(async (resolve, reject) => {
      let result = await getBalenaRelease();
      resolve(result);
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

  getSerialDebugger: async function () {
    return new Promise(async (resolve, reject) => {
      resolve(result);
    });
  },
};
