/// <reference path="../typings/node.d.ts" />


import Promise from "../src/yaku";

let p = Promise.resolve<any>(null);

let count = 0;

setInterval(function () {
    return p = p.then(function () {
        return new Promise(function (r) {
            return setTimeout(function () {
                count++;
                return r({
                    data: "ok"
                });
            });
        });
    });
});

setInterval(function () {
    return global.console.log(count, process.memoryUsage());
}, 1000);
