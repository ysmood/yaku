var _ = require("./_");

module.exports = function (fn, self) {
    return function () {
        var args, cb, j;
        args = 2 <= arguments.length ?
            _.slice.call(arguments, 0, j = arguments.length - 1) :
            (j = 0, []), cb = arguments[j++];

        if (!_.isFunction(cb)) {
            args.push(cb);
            return fn.apply(self, args);
        }
        if (arguments.length === 1) {
            args = [cb];
            cb = null;
        }
        return fn.apply(self, args).then(function (val) {
            return typeof cb === "function" ? cb(null, val) : void 0;
        })["catch"](function (err) {
            if (cb) {
                return cb(err);
            } else {
                return _.Promise.reject(err);
            }
        });
    };
};
