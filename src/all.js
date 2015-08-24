var Promise = require("./yaku");

var utils = require("./utils.coffee");
var source = require("./source");

for (var key in utils) {
    Promise[key] = utils[key];
}

Promise.source = source;

module.exports = Promise;
