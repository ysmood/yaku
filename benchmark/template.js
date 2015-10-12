var cs, kit;

kit = require("nokit");

cs = kit.require("brush");


/**
 * The test will run 10 ^ 5 promises.
 * Each promise will resolve after 1ms.
 * When all tasks are done, print out how much time it takes.
 */

module.exports = function (name, Promise) {
    var ver = (function () {
        try {
            return require("../node_modules/" + name + "/package.json").version;
        } catch (error) {
            return require("../package.json").version;
        }
    })();

    var countDown = Math.pow(10, 5);

    function checkEnd () {
        if (--countDown) {
            return;
        }
        return logResult();
    }

    function logResult () {
        var k, mem, memFormat, resolutionTime, v;
        resolutionTime = Date.now() - startResolution;
        mem = process.memoryUsage();
        memFormat = [];
        for (k in mem) {
            v = mem[k];
            memFormat.push(k + " - " + (Math.floor(v / 1024 / 1024)) + "mb");
        }

        return console.log((cs.cyan(name))
            + " v"
            + ver
            + "\n             total: "
            + (cs.green(initTime + resolutionTime))
            + "ms\n                init: "
            + initTime
            + "ms\n    resolution: "
            + resolutionTime
            + "ms\n            memory: "
            + (memFormat.join(" | ")));
    }

    function resolver (resolve) {
        return setTimeout(resolve, 1);
    }

    function asyncTask () {
        return new Promise(resolver).then(checkEnd);
    }

    var i = countDown;
    var initTime;
    var initStart = Date.now();
    while (i--) {
        asyncTask();
    }

    var startResolution = Date.now();
    return initTime = startResolution - initStart;
};
