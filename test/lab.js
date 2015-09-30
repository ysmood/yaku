/*eslint-disable */

var Promise, c, fn, utils;

Promise = require('../src/yaku');

utils = require('../src/utils');

c = 0;

fn = function (v) {
    console.log('do');
    return utils.sleep(0).then(function () {
        if (c++ < 2) {
            throw 1;
        } else {
            return v;
        }
    });
};

utils.retry(3, fn)('ok').then(function (v) {
    return console.log('done', v);
}, function (errs) {
    return console.log('err', errs, c);
});
