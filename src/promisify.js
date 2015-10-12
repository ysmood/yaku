var _ = require("./_");

module.exports = function (fn, self) {
    return function () {
        var len = arguments.length
        , args = new Array(len);

        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }

        if (_.isFunction(args[len - 1])) {
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
