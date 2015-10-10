var junit = require("junit");
var testSuit = require("./testSuit");
var Promise = require("../src/yaku");

var it = junit();

var basic = function () {
    var list = require("./basic")(testSuit(it, "basic"));
    for (var i = 0; i < list.length; i++) list[i] = list[i]();

    return Promise.all(list);
}();

var unhandledRejection = function () {
    var list = require("./unhandledRejection")(testSuit(it, "unhandledRejection"));
    var p = Promise.resolve();

    function iter (i) {
        p = p.then(function () {
            return list[i]();
        });
    }

    for (var i = 0; i < list.length; i++) iter(i);

    return p;
}();

it.run([basic, unhandledRejection]);
