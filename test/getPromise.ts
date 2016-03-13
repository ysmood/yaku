declare let require, global;

let kit = require("nokit");
let spawnSync = require("child_process").spawnSync;

let map = {
    yaku: function () {
        let Promise = require("../src/yaku");
        this.optionalHelper = "✓";
        this.helper = propSize(Promise) + propSize(Promise.prototype) + propSize(require("../src/utils"));
        setSize("yaku", "dist/yaku.min.js");
        return Promise;
    },

    bluebird: function () {
        let Promise = require("bluebird");
        this.optionalHelper = "partial";
        this.helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("bluebird", "node_modules/bluebird/js/browser/bluebird.core.min.js");
        return Promise;
    },

    "es6-promise": function () {
        let Promise = require("es6-promise").Promise;
        this.optionalHelper = "x";
        this.helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("es6-promise", "node_modules/es6-promise/dist/es6-promise.min.js");
        return Promise;
    },

    native: function () {
        let Promise = global.Promise;
        this.optionalHelper = "x";
        this.helper = propSize(Promise) + propSize(Promise.prototype);
        this.size = 0;
        return Promise;
    },

    "core-js": function () {
        let Promise = require("core-js/fn/promise");
        this.optionalHelper = "x";
        this.helper = propSize(Promise) + propSize(Promise.prototype);

        spawnSync("webpack");
        spawnSync("node_modules/.bin/uglifyjs", [
            "-mc", "-o", "dist/coreJsPromise.min.js", "dist/coreJsPromise.js"
        ]);
        setSize("core-js", "dist/coreJsPromise.min.js");

        return Promise;
    },

    "es6-shim": function () {
        require("es6-shim");

        let Promise = global.Promise;
        this.optionalHelper = "x";
        this.helper = propSize(Promise) + propSize(Promise.prototype);
        setSize("es6-shim", "node_modules/es6-shim/es6-shim.js");

        return Promise;
    },

    q: function () {
        let Promise = require("q");

        this.optionalHelper = "x";
        this.helper = propSize(Promise) + propSize(Promise.prototype);

        spawnSync("node_modules/.bin/uglifyjs", [
            "-mc", "-o", "node_modules/q/q.min.js", "node_modules/q/q.js"
        ]);
        setSize("q", "node_modules/q/q.min.js");

        return Promise;
    }
};

export default function (shim) {
    return map[shim]();
};

export { map };

function propSize (obj) {
    return Object.getOwnPropertyNames(obj).filter(function (name) {
        // filter the hidden helpers
        return name.indexOf("_") !== 0;
    }).length;
}

function setSize (shim, path) {
    let s = kit.statSync(path).size / 1024;
    map[shim].size = Math.round(s * 10) / 10;
}

