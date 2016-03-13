/// <reference path="../typings/node.d.ts" />

let promisesAplusTests = require("promises-aplus-tests");
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
        }
    };

    return kit.promisify(promisesAplusTests)(adapter, opts);
};
