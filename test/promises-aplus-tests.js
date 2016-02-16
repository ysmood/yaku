var promisesAplusTests = require("promises-aplus-tests");
var kit = require("nokit");
var getPromise = require("./getPromise");


module.exports = function (opts) {
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
        }
    };

    return kit.promisify(promisesAplusTests)(adapter, opts);
};
