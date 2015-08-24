var Yaku = require("./yaku");

var utils = require("./utils.coffee");
var source = require("./source");

for (var key in utils) {
    Yaku[key] = utils[key];
}

Yaku.source = source;

window.Yaku = Yaku;
