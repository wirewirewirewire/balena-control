const fs = require("fs");
const util = require("util");
const path = require("path");

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

module.exports = {
  init: function () {},

  getSerialDebugger: async function () {
    return new Promise(async (resolve, reject) => {
      resolve(result);
    });
  },
};
