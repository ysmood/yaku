import _ from "./_";
import sleep from "./sleep";
var $retryError = {};

export default (initRetries, span, fn, self) => function () {
    var retries = initRetries;
    var errs = [];
    var args = arguments;

    if (_.isFunction(span)) {
        self = fn;
        fn = span;
        span = 0;
    }

    var countdown = _.isFunction(retries) ?
        retries : () => sleep(span, --retries);

    function tryFn (isContinue) {
        return isContinue ? fn.apply(self, args) : _.Promise.reject($retryError);
    }

    function onError (err) {
        if (err === $retryError) return _.Promise.reject(errs);

        errs.push(err);
        return attempt(countdown(errs));
    }

    function attempt (c) {
        return _.Promise.resolve(c).then(tryFn)["catch"](onError);
    }

    return attempt(true);
};
