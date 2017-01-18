import _ from "./_";

export default (fn, self) => function () {
    var args;
    var cb;
    var j;
    args = 2 <= arguments.length ?
        _.slice.call(arguments, 0, j = arguments.length - 1) :
        (j = 0, []), cb = arguments[j++];

    var isFn = _.isFunction(cb);

    if (!isFn) {
        args.push(cb);
        return fn.apply(self, args);
    }

    return fn.apply(self, args).then(val => {
        cb(null, val);
    })["catch"](cb);
};
