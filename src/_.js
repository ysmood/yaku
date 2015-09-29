var slice = [].slice;

module.exports = {
    isNumber: function (obj) {
        return typeof obj === 'number';
    },

    slice: slice,

    isArray: function (obj) {
        return obj instanceof Array;
    },

    isFunction: function (obj) {
        return typeof obj === 'function';
    }
};
