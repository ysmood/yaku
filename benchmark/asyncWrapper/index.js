var name = process.argv[2];
var getWrapper = require("./getWrapper");
var box = getWrapper(name);
var Promise = box.Promise;
var async = box.async;

var countDown = Math.pow(10, 4);

function resolver (resolve) {
    return setTimeout(resolve, 1);
}

function asyncTask () {
    return new Promise(resolver).then(checkEnd);
}

function checkEnd () {
    if (--countDown) {
        return;
    }
    var span = Date.now() - startTime;
    return global.console.log(name + ":", span + "ms");
}

function test () {
    var fn = async(function * () {
        for (var i = 0; i < 10; i++)
            yield asyncTask();
    });

    fn().then(checkEnd);
}

var startTime = Date.now();
var i = countDown;

while (i--) {
    test();
}
