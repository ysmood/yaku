/// <reference path="../typings/node.d.ts" />

let promisesES6Tests = require("promises-es6-tests");
let assert = require("assert");
let kit = require("nokit");
let getPromise = require("./getPromise");

export default function (opts) {
    let Promise = getPromise(opts.shim);

    let adapter = {
        deferred: function () {
            let defer;
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

    return kit.promisify(promisesES6Tests)(adapter);
};
