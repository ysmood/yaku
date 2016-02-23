var Promise, count, p;

Promise = require("../src/yaku");

p = Promise.resolve();

count = 0;

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
