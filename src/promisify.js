var _ = require('./_');

module.exports = function (fn, self) {
    return function () {
        var args;
        args = 1 <= arguments.length ? _.slice.call(arguments, 0) : [];
        if (_.isFunction(args[args.length - 1])) {
            return fn.apply(self, args);
        }
        return new _.Promise(function (resolve, reject) {
            args.push(function () {
                if (arguments[0] != null) {
                    return reject(arguments[0]);
                } else {
                    return resolve(arguments[1]);
                }
            });
            return fn.apply(self, args);
        });
    };
};
