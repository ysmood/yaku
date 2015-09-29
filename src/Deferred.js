var Promise = require('./yaku');

module.exports = function () {
    var defer;
    defer = {};
    defer.promise = new Promise(function (resolve, reject) {
        defer.resolve = resolve;
        return defer.reject = reject;
    });
    return defer;
};
