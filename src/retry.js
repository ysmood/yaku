var Promise = require('./yaku');

module.exports = function (times, fn) {
    var errs = [];
    return function tryFn () {
        var args = arguments;
        return fn(arguments).catch(function (err) {
            errs.push(err);
            return times-- ? Promise.reject(errs) : tryFn(args);
        });
    };
};
