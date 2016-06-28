var kit = require("nokit");
var spawnSync = require("child_process").spawnSync;

var map = {
    yaku: function () {
        var Promise = require("../src/yaku");
        map.yaku.optionalHelper = "✓";
        map.yaku.coverage = "100% 100%";
        map.yaku.helper = propSize(Promise) + propSize(Promise.prototype) + propSize(require("../src/utils"));
        setSize("yaku", "dist/yaku.min.js");
        return Promise;
    },

    bluebird: function () {
        var Promise = require("bluebird");
        map.bluebird.optionalHelper = "partial";
        map.bluebird.coverage = "99% 96%";
        map.bluebird.helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("bluebird", "node_modules/bluebird/js/browser/bluebird.core.min.js");
        return Promise;
    },

    "es6-promise": function () {
        var Promise = require("es6-promise").Promise;
        map["es6-promise"].optionalHelper = "x";
        map["es6-promise"].coverage = "? ?";
        map["es6-promise"].helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("es6-promise", "node_modules/es6-promise/dist/es6-promise.min.js");
        return Promise;
    },

    native: function () {
        var Promise = global.Promise;
        map.native.optionalHelper = "x";
        map.native.coverage = "? ?";
        map.native.helper = propSize(Promise) + propSize(Promise.prototype);
        map.native.size = 0;
        return Promise;
    },

    "core-js": function () {
        var Promise = require("core-js/fn/promise");
        map["core-js"].optionalHelper = "x";
        map["core-js"].coverage = "? ?";
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
        map["es6-shim"].optionalHelper = "x";
        map["es6-shim"].coverage = "? ?";
        map["es6-shim"].helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("es6-shim", "node_modules/es6-shim/es6-shim.min.js");

        return Promise;
    },

    q: function () {
        var Promise = require("q");

        map.q.optionalHelper = "x";
        map.q.coverage = "? ?";
        map.q.helper = propSize(Promise) + propSize(Promise.prototype);

        spawnSync("node_modules/.bin/uglifyjs", [
            "-mc", "-o", "node_modules/q/q.min.js", "node_modules/q/q.js"
        ]);
        setSize("q", "node_modules/q/q.min.js");

        return Promise;
    },

    "my-promise": function () {
        var Promise = require("my-promise").Promise;

        map["my-promise"].optionalHelper = "x";
        map["my-promise"].coverage = "? ?";
        map["my-promise"].helper = propSize(Promise) + propSize(Promise.prototype);

        spawnSync("webpack");
        spawnSync("node_modules/.bin/uglifyjs", [
            "-mc", "-o", "dist/my-promise.min.js", "dist/my-promise.js"
        ]);
        setSize("my-promise", "dist/my-promise.min.js");

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

