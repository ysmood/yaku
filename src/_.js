var Promise = require('./yaku');

module.exports = {

    isArray: function (obj) {
        return obj instanceof Array;
    },

    isFunction: function (obj) {
        return typeof obj === 'function';
    },

    isNumber: function (obj) {
        return typeof obj === 'number';
    },

    Promise: Promise,

    slice: [].slice

};
