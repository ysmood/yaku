import _ from "./_";

// Hack: we don't create new object to pass the newly iterated object.
var $ArrIterContainer = {
    value: null,
    done: false
};

var ArrIter = _.extendPrototype(function (arr) {
    this.arr = arr;
    this.len = arr.length;
}, {
    i: 0,
    next() {
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
function genIterator<T> (obj): IterableIterator<T> {
    if (obj) {
        var gen = obj[_.Promise.Symbol.iterator];
        if (_.isFunction(gen)) {
            return gen.call(obj);
        }

        if (obj instanceof Array) {
            return new ArrIter(obj);
        }

        if (_.isFunction(obj.next)) {
            return obj;
        }
    }
    throw new TypeError("invalid_argument");
}

export default genIterator;
