var _ = require("./_");
var isFn = _.isFunction;

module.exports = function (fn, self) {
    return function (a, b, c, d, e) {
        var len = arguments.length
        , args, promise, resolve, reject;

        promise = new _.Promise(function (r, rj) {
            resolve = r;
            reject = rj;
        });

        function cb (err, val) {
            err == null ? resolve(val) : reject(err);
        }

        switch (len) {
        case 0: fn(cb); break;
        case 1: isFn(a) ? fn(a) : fn(a, cb); break;
        case 2: isFn(b) ? fn(a, b) : fn(a, b, cb); break;
        case 3: isFn(c) ? fn(a, b, c) : fn(a, b, c, cb); break;
        case 4: isFn(d) ? fn(a, b, c, d) : fn(a, b, c, d, cb); break;
        case 5: isFn(e) ? fn(a, b, c, d, e) : fn(a, b, c, d, e, cb); break;
        default:
            args = new Array(len);

            for (var i = 0; i < len; i++) {
                args[i] = arguments[i];
            }

            if (isFn(args[len - 1])) {
                return fn.apply(self, args);
            }

            args[i] = cb;
            fn.apply(self, args);
        }

        return promise;
    };
};
