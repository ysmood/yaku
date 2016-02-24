var kit = require("nokit");
var spawnSync = require("child_process").spawnSync;

var map = {
    yaku: function () {
        var Promise = require("../src/yaku");
        map.yaku.test = "✓";
        map.yaku.optionalHelper = "✓";
        map.yaku.helper = propSize(Promise) + propSize(Promise.prototype) + propSize(require("../src/utils"));
        setSize("yaku", "dist/yaku.min.js");
        return Promise;
    },

    bluebird: function () {
        var Promise = require("bluebird");
        map.bluebird.test = "x (18 failing)";
        map.bluebird.optionalHelper = "partial";
        map.bluebird.helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("bluebird", "node_modules/bluebird/js/browser/bluebird.core.min.js");
        return Promise;
    },

    "es6-promise": function () {
        var Promise = require("es6-promise").Promise;
        map["es6-promise"].test = "x (52 failing)";
        map["es6-promise"].optionalHelper = "x";
        map["es6-promise"].helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("es6-promise", "node_modules/es6-promise/dist/es6-promise.min.js");
        return Promise;
    },

    native: function () {
        var Promise = global.Promise;
        map.native.test = "x ( 4 failing)";
        map.native.optionalHelper = "x";
        map.native.helper = propSize(Promise) + propSize(Promise.prototype);
        map.native.size = 0;
        return Promise;
    },

    "core-js": function () {
        require("core-js/modules/es6.promise.js");

        var Promise = global.Promise;
        map["core-js"].test = "x ( 4 failing)";
        map["core-js"].optionalHelper = "x";
        map["core-js"].helper = propSize(Promise) + propSize(Promise.prototype);

        spawnSync("webpack");
        spawnSync("node_modules/.bin/uglifyjs", [
            "-mc", "-o", "dist/coreJsPromise.min.js", "dist/coreJsPromise.js"
        ]);
        setSize("core-js", "dist/coreJsPromise.min.js");

        return Promise;
    },

    "es6-shim": function () {
        require("es6-shim");

        var Promise = global.Promise;
        map["es6-shim"].test = "✓";
        map["es6-shim"].optionalHelper = "x";
        map["es6-shim"].helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("es6-shim", "node_modules/es6-shim/es6-shim.js");

        return Promise;
    },

    q: function () {
        var Promise = require("q");

        map.q.test = "x (47 failing)";
        map.q.optionalHelper = "x";
        map.q.helper = propSize(Promise) + propSize(Promise.prototype);

        spawnSync("node_modules/.bin/uglifyjs", [
            "-mc", "-o", "node_modules/q/q.min.js", "node_modules/q/q.js"
        ]);
        setSize("q", "node_modules/q/q.min.js");

        return Promise;
    }
};

module.exports = function (shim) {
    return map[shim]();
};

module.exports.map = map;

function propSize (obj) {
    return Object.getOwnPropertyNames(obj).filter(function (name) {
        // filter the hidden helpers
        return name.indexOf("_") !== 0;
    }).length;
}

function setSize (shim, path) {
    var s = kit.statSync(path).size / 1024;
    map[shim].size = Math.round(s * 10) / 10;
}