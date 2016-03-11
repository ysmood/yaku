import _ from "./_";

export default function (fn: Function, self?): Function {
    return function () {
        let args, cb, j;
        args = 2 <= arguments.length ?
            _.slice.call(arguments, 0, j = arguments.length - 1) :
            (j = 0, []), cb = arguments[j++];

        let isFn = _.isFunction(cb);

        if (!isFn) {
            args.push(cb);
            return fn.apply(self, args);
        }

        if (!isFn && arguments.length === 1) {
            args = [cb];
            cb = null;
        }

        return fn.apply(self, args).then(function (val) {
            return isFn ? cb(null, val) : void 0;
        })["catch"](function (err) {
            if (cb) {
                return cb(err);
            } else {
                return _.Promise.reject(err);
            }
        });
    };
};
