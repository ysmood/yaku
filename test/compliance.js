var Promise, promisesAplusTests;

promisesAplusTests = require("promises-aplus-tests");

Promise = require("../src/yaku");

module.exports = function (opts) {
    var adapter;
    adapter = {
        deferred: function () {
            var defer;
            defer = {};
            defer.promise = new Promise(function (resolve, reject) {
                defer.resolve = resolve;
                return defer.reject = reject;
            });
            return defer;
        }
    };
    return promisesAplusTests(adapter, opts, function (err) {
        if (err) {
            return process.exit(1);
        }
    });
};
