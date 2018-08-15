/**
 * Tests for aplus specs
 */

var promisesAplusTests = require('promises-aplus-tests');
var kit = require('nokit');
var getPromise = require('./getPromise');

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
    }
};

kit.promisify(promisesAplusTests)(adapter, opts)['catch'](kit.throw);
