"use strict";

var Promise = require("../lib/yaku.js");

new Promise(function (resolve) {
    setTimeout(function () {
        resolve();
    });
}).then(function () {
    global.console.log("done");
});
