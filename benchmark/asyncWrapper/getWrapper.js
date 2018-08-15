var map = {
    yaku: function () {
        return {
            Promise: require('../../src/yaku'),
            async: require('../../src/async')
        };
    },
    co: function () {
        return {
            Promise: global.Promise,
            async: require('co').wrap
        };
    },
    bluebird: function () {
        var Promise = require('bluebird');
        return {
            Promise: Promise,
            async: Promise.coroutine
        };
    }
};

module.exports = function (shim) {
    return map[shim]();
};

module.exports.map = map;
