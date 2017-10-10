/**
 * Test for ES6 specs
 */

var promisesES6Tests = require("promises-es6-tests");
var assert = require("assert");
var kit = require("nokit");
var getPromise = require("./getPromise");
var opts = JSON.parse(process.argv[2]);

var Promise = getPromise(opts.shim);

var adapter = {
    deferred: function () {
        var defer;
        defer = {};
        defer.promise = new Promise(function (resolve, reject) {
            defer.resolve = resolve;
            return defer.reject = reject;
        });
        return defer;
    },

    defineGlobalPromise: function (global) {
        global.Promise = Promise;
        global.assert = assert;
    },

    removeGlobalPromise: function (global) {
        delete global.Promise;
    }
};

kit.promisify(promisesES6Tests)(adapter)["catch"](kit.throw);
