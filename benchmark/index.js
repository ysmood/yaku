
var name = process.argv[2];
var isCountTest = process.argv[3];

var getPromise = require("../test/getPromise");
var Promise = getPromise(name);
var testCount = require("./testCount");

/**
 * The test will run 10 ^ 5 promises.
 * Each promise will resolve after 1ms.
 * When all tasks are done, print out how much time it takes.
 */

var ver = (function () {
    if (name.indexOf("yaku") > -1)
        return require("../package.json").version;
    else
        return require("../node_modules/" + name + "/package.json").version;
})();

var countDown = Math.pow(10, 5);

function checkEnd () {
    if (--countDown) {
        return;
    }
    return logResult();
}

function logResult () {
    var resolutionTime = Date.now() - startResolution;
    var mem = process.memoryUsage();

    return console.log( // eslint-disable-line
        "| [" + name + "][]@" + ver
        + " | " + (isCountTest === "on" ? testCount(name) : "disabled")
        + " | " + getPromise.map[name].coverage
        + " | " + (initTime + resolutionTime) + "ms"
        + " / " + (Math.floor(mem.rss / 1024 / 1024)) + "MB"
        + " | " + getPromise.map[name].optionalHelper
        + " | " + getPromise.map[name].helper
        + " | " + getPromise.map[name].size + "KB |"
    );
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
initTime = startResolution - initStart;
