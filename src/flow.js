var _ = require('./_');
var end = require('./end');
var isPromise = require('./isPromise');

module.exports = function () {
    var fns;
    fns = 1 <= arguments.length ? _.slice.call(arguments, 0) : [];
    return function (val) {
        var genIter, iter, run;
        genIter = function (arr) {
            var iterIndex;
            iterIndex = 0;
            return function (val) {
                var fn;
                fn = arr[iterIndex++];
                if (fn === void 0) {
                    return end;
                } else if (_.isFunction(fn)) {
                    return fn(val);
                } else {
                    return fn;
                }
            };
        };
        if (_.isArray(fns[0])) {
            iter = genIter(fns[0]);
        } else if (fns.length === 1 && _.isFunction(fns[0])) {
            iter = fns[0];
        } else if (fns.length > 1) {
            iter = genIter(fns);
        } else {
            throw new TypeError('wrong argument type: ' + fns);
        }
        run = function (preFn) {
            return preFn.then(function (val) {
                var fn;
                fn = iter(val);
                if (fn === end) {
                    return val;
                }
                return run(isPromise(fn) ? fn : _.isFunction(fn) ? _.Promise.resolve(fn(val)) : _.Promise.resolve(fn));
            });
        };
        return run(_.Promise.resolve(val));
    };
};
