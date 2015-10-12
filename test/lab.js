/*eslint-disable */


Yaku = require('../src/yaku');

utils = require('../src/utils');

var Observable = utils.Observable;
var sleep = utils.sleep;

var src = new Observable(function (emit) {
    setInterval(emit, 1000, 0);
});

var a = src.subscribe(function (v) { return v + 1; });
var b = src.subscribe(function (v) {
    return sleep(10, v + 2);
});

var out = Observable.all([a, b]);

out.subscribe(function (arr) {
    console.log(arr);
})
