var Promise = require('./yaku');

module.exports = function (time, val) {
    return new Promise(function (r) {
        return setTimeout((function () {
            return r(val);
        }), time);
    });
};
