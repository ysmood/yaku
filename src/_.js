
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
    slice: [].slice

};
