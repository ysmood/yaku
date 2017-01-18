import Promise from "./yaku";

export default {

    extendPrototype(src, target) {
        for (var k in target) {
            src.prototype[k] = target[k];
        }
        return src;
    },

    isFunction(obj) {
        return typeof obj === "function";
    },

    isNumber(obj) {
        return typeof obj === "number";
    },

    Promise,

    slice: [].slice

};
