var _ = require("./_");
var $retryError = {};

module.exports = function (retries, fn, self) {
    var errs = [], args;
    var countdown = _.isFunction(retries) ?
        retries : function () { return retries--; };

    function tryFn (isContinue) {
        return isContinue ? fn.apply(self, args) : _.Promise.reject($retryError);
    }

    function onError (err) {
        if (err === $retryError) return _.Promise.reject(errs);

        errs.push(err);
        return attempt();
    }

    function attempt () {
        if (args === void 0) args = arguments;
        return _.Promise.resolve(countdown(errs)).then(tryFn).catch(onError);
    }

    return attempt;
};
