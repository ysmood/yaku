var _ = require("./_");

_.Promise.prototype.guard = function (error, onRejected) {
    return this.catch(function (reason) {
        if (reason instanceof error && onRejected)
            return onRejected(reason);
        else
            return _.Promise.reject(reason);
    });
};
