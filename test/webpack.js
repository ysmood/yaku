"use strict";

var Promise = require("../lib/yaku.js");

new Promise(function (resolve) {
    setTimeout(function () {
        resolve();
    });
}).then(function () {
    console.log("done");
});
