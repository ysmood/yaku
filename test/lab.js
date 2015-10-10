/*eslint-disable */

var Promise, c, fn, utils;

Promise = require('../src/yaku');

utils = require('../src/utils');

a = new utils.Observable(function (emit) {
    setInterval(emit, 1000, 'OK');
})

b = a.subscribe(function (v) {
    return v + ' - ';
})

b.subscribe(function (v) {
    console.log(v);
})
