import Promise from "./yaku";

export default {

    extendPrototype: function (src: Function, target): Function {
        for (let k in target) {
            src.prototype[k] = target[k];
        }
        return src;
    },

    isArray: function (obj): boolean {
        return obj instanceof Array;
    },

    isFunction: function (obj): boolean {
        return typeof obj === "function";
    },

    isNumber: function (obj): boolean {
        return typeof obj === "number";
    },

    Promise: Promise,

    slice: [].slice

};
