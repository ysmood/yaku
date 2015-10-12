/*eslint-disable */


Yaku = require('../src/yaku');

utils = require('../src/utils');

var src = new utils.Observable(function (emit) {
    setTimeout(emit, 100, 0);
});

var a = src.subscribe(function (v) { return v + 1; });
var b = src.subscribe(function (v) {
    console.log("***", v)
    return Yaku.reject(v);
});

var out = utils.Observable.all([a, b]);

return new Yaku(function (r, rr) {
    out.subscribe(null, function (v) {
        console.log("&&&")
        rr(v)
    });
});
