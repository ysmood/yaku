// This file is intended for browser only.

var Yaku = require("./global");

var utils = require("./utils");

for (var key in utils) {
    Yaku[key] = utils[key];
}

window.Yaku = Yaku;
