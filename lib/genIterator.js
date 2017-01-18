"use strict";
var _1 = require("./_");
var yaku_1 = require("./yaku");
// Hack: we don't create new object to pass the newly iterated object.
var $ArrIterContainer = {
    value: null,
    done: false
};
var ArrIter = _1["default"].extendPrototype(function (arr) {
    this.arr = arr;
    this.len = arr.length;
}, {
    i: 0,
    next: function () {
        var self = this;
        $ArrIterContainer.value = self.arr[self.i++];
        $ArrIterContainer.done = self.i > self.len;
        return $ArrIterContainer;
    }
});
/**
 * Generate a iterator
 * @param  {Any} obj
 * @return {Function}
 */
function genIterator(obj) {
    if (obj) {
        var gen = obj[yaku_1["default"].Symbol.iterator];
        if (_1["default"].isFunction(gen)) {
            return gen.call(obj);
        }
        if (obj instanceof Array) {
            return new ArrIter(obj);
        }
        if (_1["default"].isFunction(obj.next)) {
            return obj;
        }
    }
    throw new TypeError("invalid_argument");
}
exports.__esModule = true;
exports["default"] = genIterator;
